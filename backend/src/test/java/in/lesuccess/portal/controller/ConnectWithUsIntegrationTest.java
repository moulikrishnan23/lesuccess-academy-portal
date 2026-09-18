package in.lesuccess.portal.controller;

import in.lesuccess.portal.connectwithus.ConnectWithUs;
import in.lesuccess.portal.connectwithus.ConnectWithUsRepository;
import in.lesuccess.portal.connectwithus.ConnectWithUsRequest;
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
 * {@code CourseEnquiryIntegrationTest}. Tests the full POST → validated →
 * persisted flow against the real V25 schema.
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
class ConnectWithUsIntegrationTest {

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
        // See ContactIntegrationTest for why the driver and dialect must both be
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
    private ConnectWithUsRepository repository;

    private static final ParameterizedTypeReference<ApiResponse<Object>> API_RESPONSE =
            new ParameterizedTypeReference<>() {};

    private ResponseEntity<ApiResponse<Object>> post(ConnectWithUsRequest request) {
        return restTemplate.exchange("/api/connect-with-us", HttpMethod.POST,
                new HttpEntity<>(request), API_RESPONSE);
    }

    private ConnectWithUs findByMobile(String mobile) {
        return repository.findAll().stream()
                .filter(c -> mobile.equals(c.getMobile()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Order(1)
    @DisplayName("POST → 201 → every field persisted to connect_with_us")
    void create_shouldPersistAllFields() {
        ConnectWithUsRequest request = ConnectWithUsRequest.builder()
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .build();

        ResponseEntity<ApiResponse<Object>> response = post(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        ConnectWithUs saved = findByMobile("9884455667");

        assertThat(saved.getName()).isEqualTo("Divya Ramesh");
        assertThat(saved.getEmail()).isEqualTo("divya.ramesh@gmail.com");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getIpAddress()).isNotBlank();
    }

    @Test
    @Order(2)
    @DisplayName("Only name and mobile supplied → 201, email column null")
    void create_withOnlyRequiredFields_shouldPersist() {
        ConnectWithUsRequest request = ConnectWithUsRequest.builder()
                .name("Karthik S")
                .mobile("9003344556")
                .build();

        assertThat(post(request).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        assertThat(findByMobile("9003344556").getEmail()).isNull();
    }

    @Test
    @Order(3)
    @DisplayName("Missing name → 400, nothing written")
    void missingName_shouldReturn400() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(ConnectWithUsRequest.builder()
                .name("   ")
                .mobile("9111222333")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(4)
    @DisplayName("Missing mobile → 400, nothing written")
    void missingMobile_shouldReturn400() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(ConnectWithUsRequest.builder()
                .name("No Number")
                .mobile(null)
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(5)
    @DisplayName("Malformed mobile → 400, nothing written")
    void malformedMobile_shouldReturn400() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(ConnectWithUsRequest.builder()
                .name("Bad Number")
                .mobile("12345")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(6)
    @DisplayName("Present-but-invalid email → 400, nothing written")
    void invalidEmail_shouldReturn400() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(ConnectWithUsRequest.builder()
                .name("Bad Email")
                .mobile("9222333444")
                .email("not-an-email")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(7)
    @DisplayName("Duplicate POST within the window → returns existing, no new row")
    void duplicatePost_shouldNotCreateASecondRow() {
        ConnectWithUsRequest request = ConnectWithUsRequest.builder()
                .name("Repeat Sender")
                .mobile("9555666777")
                .build();

        assertThat(post(request).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        long after = repository.count();

        assertThat(post(request).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repository.count()).isEqualTo(after);
    }

    @Test
    @Order(8)
    @DisplayName("Honeypot POST → 201, no new row")
    void honeypot_shouldNotPersist() {
        long before = repository.count();

        ResponseEntity<ApiResponse<Object>> response = post(ConnectWithUsRequest.builder()
                .name("Bot")
                .mobile("9666777888")
                .website("http://spam.example")
                .build());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(repository.count()).isEqualTo(before);
    }

    @Test
    @Order(9)
    @DisplayName("HTML in the name is sanitized")
    void htmlInFreeText_shouldBeSanitized() {
        assertThat(post(ConnectWithUsRequest.builder()
                .name("<script>alert('xss')</script>Mallory")
                .mobile("9777888999")
                .build()).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        assertThat(findByMobile("9777888999").getName())
                .doesNotContain("<script>")
                .contains("Mallory");
    }

    @Test
    @Order(10)
    @DisplayName("Whitespace in the mobile number is normalised before storage")
    void mobileIsNormalisedBeforeStorage() {
        assertThat(post(ConnectWithUsRequest.builder()
                .name("Spaced Out")
                .mobile("+91 98888 77766")
                .build()).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        assertThat(findByMobile("+919888877766")).isNotNull();
    }

    @Test
    @Order(11)
    @DisplayName("GET list without auth → 401")
    void listWithoutAuth_shouldReturn401() {
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/connect-with-us", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
