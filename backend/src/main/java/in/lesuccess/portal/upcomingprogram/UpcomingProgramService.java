package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpcomingProgramService {

    private static final ZoneId ZONE_IST = ZoneId.of("Asia/Kolkata");

    private final UpcomingProgramRepository repository;
    private final UpcomingProgramRegistrationRepository registrationRepository;

    @Transactional(readOnly = true)
    public List<UpcomingProgramResponse> listUpcoming(UpcomingProgramType type) {
        LocalDate today = LocalDate.now(ZONE_IST);
        List<UpcomingProgram> programs = type != null
                ? repository.findUpcomingByType(type, today)
                : repository.findUpcoming(today);

        return programs.stream()
                .map(p -> UpcomingProgramResponse.from(p, registrationRepository.countByProgramId(p.getId()), false))
                .toList();
    }

    @Transactional(readOnly = true)
    public UpcomingProgramResponse getById(Long id) {
        UpcomingProgram program = findOrThrow(id);
        return UpcomingProgramResponse.from(program, registrationRepository.countByProgramId(id), false);
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
        if (request.getEventDate() != null && request.getEventDate().isBefore(LocalDate.now(ZONE_IST))) {
            throw new InvalidRequestException("Event date must be today or in the future");
        }

        UpcomingProgram entity = UpcomingProgram.builder()
                .type(request.getType())
                .label(request.getLabel() != null && !request.getLabel().isBlank() ? request.getLabel().trim() : null)
                .title(request.getTitle().trim())
                .topic(request.getTopic() != null && !request.getTopic().isBlank() ? request.getTopic().trim() : null)
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .platform(request.getPlatform() != null && !request.getPlatform().isBlank() ? request.getPlatform().trim() : null)
                .mode(request.getMode() != null && !request.getMode().isBlank() ? request.getMode().trim().toUpperCase() : "ONLINE")
                .meetLink(request.getMeetLink() != null && !request.getMeetLink().isBlank() ? request.getMeetLink().trim() : null)
                .venueAddress(request.getVenueAddress() != null && !request.getVenueAddress().isBlank() ? request.getVenueAddress().trim() : null)
                .organizationName(request.getOrganizationName() != null && !request.getOrganizationName().isBlank() ? request.getOrganizationName().trim() : null)
                .venueName(request.getVenueName() != null && !request.getVenueName().isBlank() ? request.getVenueName().trim() : null)
                .speakerName(request.getSpeakerName() != null && !request.getSpeakerName().isBlank() ? request.getSpeakerName().trim() : null)
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : null)
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
        entity.setLabel(request.getLabel() != null && !request.getLabel().isBlank() ? request.getLabel().trim() : null);
        entity.setTitle(request.getTitle().trim());
        entity.setTopic(request.getTopic() != null && !request.getTopic().isBlank() ? request.getTopic().trim() : null);
        entity.setEventDate(request.getEventDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setPlatform(request.getPlatform() != null && !request.getPlatform().isBlank() ? request.getPlatform().trim() : null);
        if (request.getMode() != null && !request.getMode().isBlank()) {
            entity.setMode(request.getMode().trim().toUpperCase());
        }
        entity.setMeetLink(request.getMeetLink() != null && !request.getMeetLink().isBlank() ? request.getMeetLink().trim() : null);
        entity.setVenueAddress(request.getVenueAddress() != null && !request.getVenueAddress().isBlank() ? request.getVenueAddress().trim() : null);
        entity.setOrganizationName(request.getOrganizationName() != null && !request.getOrganizationName().isBlank() ? request.getOrganizationName().trim() : null);
        entity.setVenueName(request.getVenueName() != null && !request.getVenueName().isBlank() ? request.getVenueName().trim() : null);
        entity.setSpeakerName(request.getSpeakerName() != null && !request.getSpeakerName().isBlank() ? request.getSpeakerName().trim() : null);
        entity.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : null);
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
                .email(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim() : null)
                .mode(program.getMode())
                .venueAddress(program.getVenueAddress())
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
                        .map(this::toRegistrationResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<UpcomingProgramRegistrationResponse> listAllRegistrations(String search, Pageable pageable) {
        org.springframework.data.domain.Page<UpcomingProgramRegistration> page;
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim();
            page = registrationRepository.findByNameContainingIgnoreCaseOrMobileNumberContainingOrEmailContainingIgnoreCase(q, q, q, pageable);
        } else {
            page = registrationRepository.findAll(pageable);
        }

        return PageResponse.from(page.map(this::toRegistrationResponse));
    }

    private UpcomingProgramRegistrationResponse toRegistrationResponse(UpcomingProgramRegistration reg) {
        UpcomingProgramRegistrationResponse resp = UpcomingProgramRegistrationResponse.from(reg);
        if ((resp.getProgramTitle() == null || resp.getProgramTitle().isBlank()) && reg.getProgramId() != null) {
            String rawTitle = repository.findRawTitleById(reg.getProgramId());
            String rawType = repository.findRawTypeById(reg.getProgramId());
            resp.setProgramTitle(rawTitle != null ? rawTitle : "(Archived Program #" + reg.getProgramId() + ")");
            if (rawType != null && (resp.getProgramType() == null || resp.getProgramType().isBlank())) {
                resp.setProgramType(rawType);
            }
        }
        return resp;
    }

    private UpcomingProgram findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Upcoming program", id));
    }
}
