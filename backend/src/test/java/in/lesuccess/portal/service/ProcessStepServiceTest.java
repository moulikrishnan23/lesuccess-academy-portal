package in.lesuccess.portal.service;

import in.lesuccess.portal.processstep.ProcessStep;
import in.lesuccess.portal.processstep.ProcessStepRepository;
import in.lesuccess.portal.processstep.ProcessStepRequest;
import in.lesuccess.portal.processstep.ProcessStepResponse;
import in.lesuccess.portal.processstep.ProcessStepService;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProcessStepServiceTest {

    @Mock
    private ProcessStepRepository repository;

    @InjectMocks
    private ProcessStepService service;

    @Test
    @DisplayName("listAll returns steps in stepNumber order")
    void listAll_shouldReturnOrdered() {
        when(repository.findAllByOrderByStepNumberAsc()).thenReturn(List.of(
                buildEntity(1L, 1, "Evaluate"),
                buildEntity(2L, 2, "Customize"),
                buildEntity(3L, 3, "Empower"),
                buildEntity(4L, 4, "Launch")));

        List<ProcessStepResponse> result = service.listAll();

        // Lambda rather than the ProcessStepResponse::getTitle method reference:
        // an unbound method reference supplies the receiver as the functional
        // parameter, which Eclipse's null analysis reports as an unchecked
        // conversion because this DTO carries no nullness annotations.
        assertThat(result.stream().map(step -> step.getTitle()).toList())
                .containsExactly("Evaluate", "Customize", "Empower", "Launch");
    }

    @Test
    @DisplayName("listAll on an unseeded table returns empty rather than failing")
    void listAll_empty_shouldReturnEmpty() {
        when(repository.findAllByOrderByStepNumberAsc()).thenReturn(List.of());

        assertThat(service.listAll()).isEmpty();
    }

    @Test
    @DisplayName("update writes title, description and stepNumber, trimming text")
    void update_shouldApplyFields() {
        ProcessStep existing = buildEntity(1L, 1, "Evaluate");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        ProcessStepRequest request = ProcessStepRequest.builder()
                .stepNumber(3)
                .title("  Empower  ")
                .description("  Hands-on delivery with mentor support.  ")
                .iconUrl("/icons/empower.svg")
                .build();

        ProcessStepResponse result = service.update(1L, request);

        // stepNumber is the reorder mechanism - writing it is how a step moves.
        assertThat(result.getStepNumber()).isEqualTo(3);
        assertThat(result.getTitle()).isEqualTo("Empower");
        assertThat(result.getDescription()).isEqualTo("Hands-on delivery with mentor support.");
        assertThat(result.getIconUrl()).isEqualTo("/icons/empower.svg");
    }

    @Test
    @DisplayName("update on unknown id -> ResourceNotFoundException")
    void update_unknownId_shouldThrow() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        ProcessStepRequest request = ProcessStepRequest.builder()
                .stepNumber(1)
                .title("Evaluate")
                .description("Understand where you stand.")
                .build();

        assertThatThrownBy(() -> service.update(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private ProcessStep buildEntity(Long id, int stepNumber, String title) {
        return ProcessStep.builder()
                .id(id)
                .stepNumber(stepNumber)
                .title(title)
                .description("Description for " + title + ".")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
