package in.lesuccess.portal.controller;

import in.lesuccess.portal.demobooking.DemoBooking;
import in.lesuccess.portal.demobooking.DemoBookingRepository;
import in.lesuccess.portal.demobooking.DemoBookingRequest;
import in.lesuccess.portal.shared.dto.ApiResponse;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test with Testcontainers MySQL, mirroring
 * {@code ContactIntegrationTest} and {@code CourseEnquiryIntegrationTest}.
 *
 * <p>Proves the protections hold against the real V23 schema — in particular
 * that {@code ip_address} is writable again after V18 dropped it.</p>
 *
 * <p>Every test uses a distinct mobile number on purpose: duplicate detection is
 * keyed on mobile within a five-minute window, so two tests sharing a number
 * would have the second one silently return the first one's row.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DemoBookingIntegrationTest {

    @SuppressWarnings("resource") // lifecycle is managed by @Testcontainers/@Container
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("lesuccess_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        // See ContactIntegrationTest for why driver and dialect must both be
        // overridden here: application-test.yml pins H2 for the slice tests.
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.jpa.properties.hibernate.dialect",
                () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("lesuccess.sheets.enabled", () -> false);
        registry.add("lesuccess.jwt.secret",
                () -> "integration-test-secret-key-that-is-at-least-256-bits-long!!");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private DemoBookingRepository repository;

    private static final ParameterizedTypeReference<ApiResponse<Object>> API_RESPONSE =
            new ParameterizedTypeReference<>() {};

    private ResponseEntity<ApiResponse<Object>> post(DemoBookingRequest request) {
        return restTemplate.exchange("/api/demo-bookings", HttpMethod.POST,
                new HttpEntity<>(request), API_RESPONSE);
    }

    private DemoBooking findByMobile(String mobile) {
        return repository.findAll().stream()
                .filter(b -> mobile.equals(b.getMobileNumber()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Order(1)
    @DisplayName("POST → 201 → booking persisted with an ip_address (restored in V23)")
    void create_shouldPersistWithIpAddress() {
        ResponseEntity<ApiResponse<Object>> response = post(DemoBookingRequest.builder()
                .courseName("Data Analytics")
                .mobileNumber("9876543210")
                .website("")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        DemoBooking saved = findByMobile("9876543210");

        assertThat(saved.getCourseName()).isEqualTo("Data Analytics");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getIpAddress())
                .as("V18 dropped this column; V23 restored it for honeypot/duplicate attribution")
                .isNotBlank();
    }

    @Test
    @Order(2)
    @DisplayName("Duplicate POST within the window → returns existing, no new row")
    void duplicatePost_shouldNotCreateASecondRow() {
        DemoBookingRequest request = DemoBookingRequest.builder()
                .courseName("AWS with DevOps")
                .mobileNumber("9111222333")
                .website("")
                .build();

        assertThat(post(request).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        long after = repository.count();

        assertThat(post(request).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repository.count()).isEqualTo(after);
    }

    @Test
    @Order(3)
    @DisplayName("Honeypot POST → 201, no new row")
    void honeypot_shouldNotPersist() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(DemoBookingRequest.builder()
                .courseName("Spam Course")
                .mobileNumber("9222333444")
                .website("http://spam.example")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(4)
    @DisplayName("HTML in the course name is sanitized")
    void htmlInCourseName_shouldBeSanitized() {
        assertThat(post(DemoBookingRequest.builder()
                .courseName("<script>alert('xss')</script><b>Data Analytics</b>")
                .mobileNumber("9333444555")
                .website("")
                .build()).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        DemoBooking saved = findByMobile("9333444555");

        assertThat(saved.getCourseName())
                .doesNotContain("<script>", "<b>")
                .contains("Data Analytics");
    }

    @Test
    @Order(5)
    @DisplayName("Whitespace in the mobile number is normalised before storage")
    void mobileIsNormalisedBeforeStorage() {
        assertThat(post(DemoBookingRequest.builder()
                .courseName("MERN Full Stack")
                .mobileNumber("+91 94444 55566")
                .website("")
                .build()).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        assertThat(findByMobile("+919444455566")).isNotNull();
    }

    @Test
    @Order(6)
    @DisplayName("Missing mobile → 400, nothing written")
    void missingMobile_shouldReturn400() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(DemoBookingRequest.builder()
                .courseName("No Number")
                .mobileNumber(null)
                .website("")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(7)
    @DisplayName("Admin listing without auth → 401")
    void adminListWithoutAuth_shouldReturn401() {
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/admin/demo-bookings", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
