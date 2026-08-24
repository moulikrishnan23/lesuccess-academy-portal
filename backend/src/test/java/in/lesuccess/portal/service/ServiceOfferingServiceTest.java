package in.lesuccess.portal.service;

import in.lesuccess.portal.serviceoffering.ServiceCategory;
import in.lesuccess.portal.serviceoffering.ServiceOffering;
import in.lesuccess.portal.serviceoffering.ServiceOfferingRepository;
import in.lesuccess.portal.serviceoffering.ServiceOfferingRequest;
import in.lesuccess.portal.serviceoffering.ServiceOfferingResponse;
import in.lesuccess.portal.serviceoffering.ServiceOfferingService;
import in.lesuccess.portal.serviceoffering.ServiceStatus;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceOfferingServiceTest {

    @Mock
    private ServiceOfferingRepository repository;

    @InjectMocks
    private ServiceOfferingService service;

    @Nested
    @DisplayName("Public listing")
    class ListPublishedTests {

        @Test
        @DisplayName("No category -> all PUBLISHED rows, never DRAFT")
        void noCategory_shouldQueryPublishedOnly() {
            when(repository.findByStatusOrderByDisplayOrderAsc(ServiceStatus.PUBLISHED))
                    .thenReturn(List.of(buildEntity(1L, ServiceCategory.INSTITUTION)));

            List<ServiceOfferingResponse> result = service.listPublished(null);

            assertThat(result).hasSize(1);
            verify(repository).findByStatusOrderByDisplayOrderAsc(ServiceStatus.PUBLISHED);
            verify(repository, never()).findByStatusAndCategoryOrderByDisplayOrderAsc(any(), any());
        }

        @Test
        @DisplayName("Category given -> filters on PUBLISHED plus that category")
        void withCategory_shouldFilterByCategory() {
            when(repository.findByStatusAndCategoryOrderByDisplayOrderAsc(
                    ServiceStatus.PUBLISHED, ServiceCategory.CORPORATE))
                    .thenReturn(List.of(buildEntity(2L, ServiceCategory.CORPORATE)));

            List<ServiceOfferingResponse> result = service.listPublished(ServiceCategory.CORPORATE);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCategory()).isEqualTo(ServiceCategory.CORPORATE);
            verify(repository, never()).findByStatusOrderByDisplayOrderAsc(any());
        }

        @Test
        @DisplayName("No matching rows -> empty list, not an error")
        void noRows_shouldReturnEmptyList() {
            when(repository.findByStatusOrderByDisplayOrderAsc(ServiceStatus.PUBLISHED))
                    .thenReturn(List.of());

            assertThat(service.listPublished(null)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Create")
    class CreateTests {

        @Test
        @DisplayName("Status omitted -> left null so @PrePersist defaults it to DRAFT")
        void statusOmitted_shouldNotBeSetByService() {
            ServiceOfferingRequest request = buildValidRequest();
            request.setStatus(null);
            when(repository.save(any())).thenReturn(buildEntity(1L, ServiceCategory.INSTITUTION));

            service.create(request);

            ArgumentCaptor<ServiceOffering> captor = ArgumentCaptor.forClass(ServiceOffering.class);
            verify(repository).save(captor.capture());
            // Nothing goes live by accident: the service must not silently promote to PUBLISHED.
            assertThat(captor.getValue().getStatus()).isNull();
        }

        @Test
        @DisplayName("Title and description are trimmed")
        void fieldsAreTrimmed() {
            ServiceOfferingRequest request = buildValidRequest();
            request.setTitle("  Corporate Training  ");
            request.setDescription("  Upskill your teams.  ");
            when(repository.save(any())).thenReturn(buildEntity(1L, ServiceCategory.CORPORATE));

            service.create(request);

            ArgumentCaptor<ServiceOffering> captor = ArgumentCaptor.forClass(ServiceOffering.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getTitle()).isEqualTo("Corporate Training");
            assertThat(captor.getValue().getDescription()).isEqualTo("Upskill your teams.");
        }
    }

    @Nested
    @DisplayName("Update")
    class UpdateTests {

        @Test
        @DisplayName("Status omitted on update -> existing status is preserved")
        void statusOmitted_shouldPreserveExistingStatus() {
            ServiceOffering existing = buildEntity(1L, ServiceCategory.INSTITUTION);
            existing.setStatus(ServiceStatus.PUBLISHED);

            ServiceOfferingRequest request = buildValidRequest();
            request.setStatus(null);

            when(repository.findById(1L)).thenReturn(Optional.of(existing));
            when(repository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

            ServiceOfferingResponse result = service.update(1L, request);

            // A PUT that does not mention status must not silently unpublish a live card.
            assertThat(result.getStatus()).isEqualTo(ServiceStatus.PUBLISHED);
        }

        @Test
        @DisplayName("Status supplied -> applied")
        void statusSupplied_shouldBeApplied() {
            ServiceOffering existing = buildEntity(1L, ServiceCategory.INSTITUTION);
            existing.setStatus(ServiceStatus.DRAFT);

            ServiceOfferingRequest request = buildValidRequest();
            request.setStatus(ServiceStatus.PUBLISHED);

            when(repository.findById(1L)).thenReturn(Optional.of(existing));
            when(repository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

            assertThat(service.update(1L, request).getStatus()).isEqualTo(ServiceStatus.PUBLISHED);
        }

        @Test
        @DisplayName("Unknown id -> ResourceNotFoundException")
        void unknownId_shouldThrow() {
            when(repository.findById(999L)).thenReturn(Optional.empty());
            ServiceOfferingRequest request = buildValidRequest();

            assertThatThrownBy(() -> service.update(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Read and delete")
    class ReadDeleteTests {

        @Test
        @DisplayName("getById returns DRAFT rows too - it is an admin route")
        void getById_shouldReturnDraft() {
            ServiceOffering draft = buildEntity(1L, ServiceCategory.INSTITUTION);
            draft.setStatus(ServiceStatus.DRAFT);
            when(repository.findById(1L)).thenReturn(Optional.of(draft));

            assertThat(service.getById(1L).getStatus()).isEqualTo(ServiceStatus.DRAFT);
        }

        @Test
        @DisplayName("getById on unknown id -> ResourceNotFoundException")
        void getById_unknown_shouldThrow() {
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.getById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Soft delete stamps deletedAt rather than removing the row")
        void softDelete_shouldStampDeletedAt() {
            ServiceOffering entity = buildEntity(1L, ServiceCategory.INSTITUTION);
            when(repository.findById(1L)).thenReturn(Optional.of(entity));

            service.softDelete(1L);

            ArgumentCaptor<ServiceOffering> captor = ArgumentCaptor.forClass(ServiceOffering.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getDeletedAt()).isNotNull();
            verify(repository, never()).delete(any());
        }

        @Test
        @DisplayName("Soft delete on unknown id -> ResourceNotFoundException")
        void softDelete_unknown_shouldThrow() {
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.softDelete(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // --- Helpers ---

    private ServiceOfferingRequest buildValidRequest() {
        return ServiceOfferingRequest.builder()
                .category(ServiceCategory.INSTITUTION)
                .title("For Institutions")
                .description("Campus training programmes built around your placement targets.")
                .iconUrl("/icons/institution.svg")
                .status(ServiceStatus.PUBLISHED)
                .displayOrder(1)
                .build();
    }

    private ServiceOffering buildEntity(Long id, ServiceCategory category) {
        return ServiceOffering.builder()
                .id(id)
                .category(category)
                .title("For Institutions")
                .description("Campus training programmes built around your placement targets.")
                .iconUrl("/icons/institution.svg")
                .status(ServiceStatus.PUBLISHED)
                .displayOrder(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
