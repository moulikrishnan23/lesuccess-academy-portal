package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.shared.dto.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UpcomingProgramServiceTest {

    @Autowired
    private UpcomingProgramService service;

    @Autowired
    private UpcomingProgramRepository programRepository;

    @Autowired
    private UpcomingProgramRegistrationRepository registrationRepository;

    @BeforeEach
    void cleanUp() {
        registrationRepository.deleteAll();
        programRepository.deleteAll();
    }

    @Test
    @DisplayName("listAllRegistrations returns empty page when no registrations")
    void listAllRegistrations_empty() {
        PageResponse<UpcomingProgramRegistrationResponse> response = service.listAllRegistrations(
                null, PageRequest.of(0, 20, Sort.by("createdAt").descending()));
        assertThat(response).isNotNull();
        assertThat(response.getContent()).isEmpty();
        assertThat(response.getTotalElements()).isEqualTo(0);
    }

    @Test
    @DisplayName("listAllRegistrations works with active program registration")
    void listAllRegistrations_withActiveProgram() {
        UpcomingProgram program = programRepository.save(UpcomingProgram.builder()
                .type(UpcomingProgramType.WEBINAR)
                .title("Full Stack Web Development")
                .eventDate(LocalDate.now().plusDays(5))
                .mode("ONLINE")
                .meetLink("https://meet.google.com/abc-defg-hij")
                .isActive(true)
                .build());

        registrationRepository.save(UpcomingProgramRegistration.builder()
                .program(program)
                .name("John Doe")
                .mobileNumber("9876543210")
                .email("john@example.com")
                .mode("ONLINE")
                .build());

        PageResponse<UpcomingProgramRegistrationResponse> response = service.listAllRegistrations(
                null, PageRequest.of(0, 20, Sort.by("createdAt").descending()));

        assertThat(response.getContent()).hasSize(1);
        UpcomingProgramRegistrationResponse item = response.getContent().get(0);
        assertThat(item.getName()).isEqualTo("John Doe");
        assertThat(item.getFullName()).isEqualTo("John Doe");
        assertThat(item.getProgramTitle()).isEqualTo("Full Stack Web Development");
        assertThat(item.getProgramType()).isEqualTo("WEBINAR");
        assertThat(item.getLocationInfo()).isEqualTo("https://meet.google.com/abc-defg-hij");
    }

    @Test
    @DisplayName("listAllRegistrations when program is soft-deleted")
    void listAllRegistrations_whenProgramSoftDeleted() {
        UpcomingProgram program = programRepository.save(UpcomingProgram.builder()
                .type(UpcomingProgramType.WEBINAR)
                .title("Full Stack Web Development")
                .eventDate(LocalDate.now().plusDays(5))
                .mode("ONLINE")
                .meetLink("https://meet.google.com/abc-defg-hij")
                .isActive(true)
                .build());

        registrationRepository.save(UpcomingProgramRegistration.builder()
                .program(program)
                .name("Jane Doe")
                .mobileNumber("9876543211")
                .email("jane@example.com")
                .mode("ONLINE")
                .build());

        // Soft delete the program
        service.softDelete(program.getId());

        // Now list registrations
        PageResponse<UpcomingProgramRegistrationResponse> response = service.listAllRegistrations(
                null, PageRequest.of(0, 20, Sort.by("createdAt").descending()));

        assertThat(response.getContent()).hasSize(1);
        UpcomingProgramRegistrationResponse item = response.getContent().get(0);
        assertThat(item.getName()).isEqualTo("Jane Doe");
        assertThat(item.getProgramTitle()).isEqualTo("Full Stack Web Development");
        assertThat(item.getProgramType()).isEqualTo("WEBINAR");
    }

    @Test
    @DisplayName("listAllRegistrations filters by email search query")
    void listAllRegistrations_searchByEmail() {
        UpcomingProgram program = programRepository.save(UpcomingProgram.builder()
                .type(UpcomingProgramType.WORKSHOP)
                .title("Cloud Computing")
                .eventDate(LocalDate.now().plusDays(10))
                .mode("OFFLINE")
                .venueAddress("Main Auditorium")
                .isActive(true)
                .build());

        registrationRepository.save(UpcomingProgramRegistration.builder()
                .program(program)
                .name("Alice")
                .mobileNumber("9876543212")
                .email("alice@domain.com")
                .mode("OFFLINE")
                .build());

        registrationRepository.save(UpcomingProgramRegistration.builder()
                .program(program)
                .name("Bob")
                .mobileNumber("9876543213")
                .email("bob@other.com")
                .mode("OFFLINE")
                .build());

        PageResponse<UpcomingProgramRegistrationResponse> response = service.listAllRegistrations(
                "alice@domain.com", PageRequest.of(0, 20, Sort.by("createdAt").descending()));

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getName()).isEqualTo("Alice");
    }
}
