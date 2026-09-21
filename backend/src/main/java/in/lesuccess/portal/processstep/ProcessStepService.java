package in.lesuccess.portal.processstep;

import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessStepService {

    private final ProcessStepRepository repository;

    @Transactional(readOnly = true)
    public List<ProcessStepResponse> listAll() {
        return repository.findAllByOrderByStepNumberAsc()
                .stream()
                .map(ProcessStepResponse::from)
                .toList();
    }

    /**
     * Admin edit. Doubles as the reorder path — writing stepNumber is how a step
     * moves, since there is no separate ordering column.
     */
    @Transactional
    public ProcessStepResponse update(Long id, ProcessStepRequest request) {
        ProcessStep entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Process step", id));

        entity.setStepNumber(request.getStepNumber());
        entity.setTitle(request.getTitle().trim());
        entity.setDescription(request.getDescription().trim());
        entity.setIconUrl(request.getIconUrl());

        ProcessStep saved = repository.saveAndFlush(entity);
        log.info("Process step updated: id={}, stepNumber={}", id, saved.getStepNumber());
        return ProcessStepResponse.from(saved);
    }
}
