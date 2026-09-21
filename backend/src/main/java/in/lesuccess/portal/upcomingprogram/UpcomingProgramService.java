package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpcomingProgramService {

    private final UpcomingProgramRepository repository;
    private final UpcomingProgramRegistrationRepository registrationRepository;

    @Transactional(readOnly = true)
    public List<UpcomingProgramResponse> listUpcoming(UpcomingProgramType type) {
        List<UpcomingProgram> programs = type != null
                ? repository.findUpcomingByType(type, LocalDate.now())
                : repository.findUpcoming(LocalDate.now());

        return programs.stream()
                .map(p -> UpcomingProgramResponse.from(p, registrationRepository.countByProgramId(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public UpcomingProgramResponse getById(Long id) {
        UpcomingProgram program = findOrThrow(id);
        return UpcomingProgramResponse.from(program, registrationRepository.countByProgramId(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<UpcomingProgramResponse> listAllForAdmin(UpcomingProgramType type, Pageable pageable) {
        var page = type != null
                ? repository.findByType(type, pageable)
                : repository.findAll(pageable);

        return PageResponse.from(page.map(p ->
                UpcomingProgramResponse.from(p, registrationRepository.countByProgramId(p.getId()))));
    }

    @Transactional
    public UpcomingProgramResponse create(UpcomingProgramRequest request) {
        UpcomingProgram entity = UpcomingProgram.builder()
                .type(request.getType())
                .label(request.getLabel())
                .title(request.getTitle().trim())
                .topic(request.getTopic())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .platform(request.getPlatform())
                .meetLink(request.getMeetLink())
                .certificateIncluded(request.isCertificateIncluded())
                .isActive(request.isActive())
                .build();

        UpcomingProgram saved = repository.save(entity);
        log.info("Upcoming program created: id={}, title={}", saved.getId(), saved.getTitle());
        return UpcomingProgramResponse.from(saved, 0);
    }

    @Transactional
    public UpcomingProgramResponse update(Long id, UpcomingProgramRequest request) {
        UpcomingProgram entity = findOrThrow(id);
        entity.setType(request.getType());
        entity.setLabel(request.getLabel());
        entity.setTitle(request.getTitle().trim());
        entity.setTopic(request.getTopic());
        entity.setEventDate(request.getEventDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setPlatform(request.getPlatform());
        entity.setMeetLink(request.getMeetLink());
        entity.setCertificateIncluded(request.isCertificateIncluded());
        entity.setActive(request.isActive());

        UpcomingProgram saved = repository.saveAndFlush(entity);
        log.info("Upcoming program updated: id={}", id);
        return UpcomingProgramResponse.from(saved, registrationRepository.countByProgramId(id));
    }

    @Transactional
    public void softDelete(Long id) {
        UpcomingProgram entity = findOrThrow(id);
        entity.setDeletedAt(LocalDateTime.now());
        entity.setActive(false);
        repository.save(entity);
        log.info("Upcoming program soft-deleted: id={}", id);
    }

    @Transactional
    public UpcomingProgramRegistrationResponse register(Long programId, UpcomingProgramRegistrationRequest request, String ipAddress) {
        UpcomingProgram program = findOrThrow(programId);

        UpcomingProgramRegistration entity = UpcomingProgramRegistration.builder()
                .program(program)
                .name(request.getName().trim())
                .mobileNumber(request.getMobileNumber())
                .ipAddress(ipAddress)
                .build();

        UpcomingProgramRegistration saved = registrationRepository.save(entity);
        log.info("Upcoming program registration created: id={}, programId={}", saved.getId(), programId);
        return UpcomingProgramRegistrationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<UpcomingProgramRegistrationResponse> listRegistrations(Long programId, Pageable pageable) {
        findOrThrow(programId);
        return PageResponse.from(
                registrationRepository.findByProgramId(programId, pageable)
                        .map(UpcomingProgramRegistrationResponse::from));
    }

    private UpcomingProgram findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Upcoming program", id));
    }
}
