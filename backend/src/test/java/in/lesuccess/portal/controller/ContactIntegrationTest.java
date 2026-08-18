package in.lesuccess.portal.controller;

import in.lesuccess.portal.dto.ApiResponse;
import in.lesuccess.portal.dto.ContactMessageRequest;
import in.lesuccess.portal.repository.ContactMessageRepository;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
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
 * Integration test with Testcontainers MySQL.
 * Tests the full POST → persisted → event published flow.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// Required in Boot 4: TestRestTemplate lives in the spring-boot-resttestclient module
// and is no longer registered by @SpringBootTest alone — it must be opted into.
@AutoConfigureTestRestTemplate
@Testcontainers
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ContactIntegrationTest {

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
        // Must be overridden too: application-test.yml pins org.h2.Driver for the
        // H2-backed slice tests, and Hikari rejects a jdbc:mysql URL opened with it
        // ("claims to not accept jdbcUrl") before Flyway ever runs.
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        // Same reason as the driver above: application-test.yml pins H2Dialect for the
        // H2-backed slice tests. Left in place against MySQL, Hibernate probes
        // information_schema.SEQUENCES — which exists in H2 but not in MySQL — and
        // fails with "Unknown table 'SEQUENCES' in information_schema".
        registry.add("spring.jpa.properties.hibernate.dialect",
                () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("lesuccess.sheets.enabled", () -> false);
        registry.add("lesuccess.jwt.secret", () -> "integration-test-secret-key-that-is-at-least-256-bits-long!!");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ContactMessageRepository repository;

    private static final ParameterizedTypeReference<ApiResponse<Object>> API_RESPONSE =
            new ParameterizedTypeReference<>() {};

    private ResponseEntity<ApiResponse<Object>> postContactMessage(ContactMessageRequest request) {
        return restTemplate.exchange("/api/contact-messages", HttpMethod.POST,
                new HttpEntity<>(request), API_RESPONSE);
    }

    @Test
    @Order(1)
    @DisplayName("POST → 201 → entity persisted in MySQL")
    void createContactMessage_shouldPersist() {
        ContactMessageRequest request = ContactMessageRequest.builder()
                .name("Integration Test User")
                .email("integration@test.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("Test Course")
                .location("Mumbai")
                .message("This is an integration test message.")
                .build();

        ResponseEntity<ApiResponse<Object>> response = postContactMessage(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();

        // Verify persisted
        assertThat(repository.count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @Order(2)
    @DisplayName("Duplicate POST within 5 min → returns existing, no new row")
    void duplicatePost_shouldReturnExisting() {
        long countBefore = repository.count();

        ContactMessageRequest request = ContactMessageRequest.builder()
                .name("Integration Test User")
                .email("integration@test.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("Test Course")
                .location("Mumbai")
                .message("This is an integration test message.")
                .build();

        ResponseEntity<ApiResponse<Object>> response = postContactMessage(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(repository.count()).isEqualTo(countBefore); // no new row
    }

    @Test
    @Order(3)
    @DisplayName("Honeypot POST → 201, no new row")
    void honeypotPost_shouldNotPersist() {
        long countBefore = repository.count();

        ContactMessageRequest request = ContactMessageRequest.builder()
                .name("Bot User")
                .email("bot@spam.com")
                .phone("+919000000000")
                .whoYouAre("Bot")
                .lookingFor("Spam")
                .location("Nowhere")
                .message("Buy cheap watches!")
                .website("http://spam.com")
                .build();

        ResponseEntity<ApiResponse<Object>> response = postContactMessage(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(repository.count()).isEqualTo(countBefore); // no new row
    }

    @Test
    @Order(4)
    @DisplayName("GET list without auth → 401")
    void getListWithoutAuth_shouldReturn401() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/contact-messages", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @Order(5)
    @DisplayName("Validation failure → 400 with errors")
    void invalidPost_shouldReturn400() {
        ContactMessageRequest request = ContactMessageRequest.builder()
                .name("")  // blank
                .email("not-valid")
                .phone("123")
                .whoYouAre("")
                .lookingFor("")
                .location("")
                .message("")
                .build();

        ResponseEntity<ApiResponse<Object>> response = postContactMessage(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
    }

    @Test
    @Order(6)
    @DisplayName("HTML in message is sanitized")
    void htmlInMessage_shouldBeSanitized() {
        ContactMessageRequest request = ContactMessageRequest.builder()
                .name("XSS Tester")
                .email("xss@test.com")
                .phone("+919111111111")
                .whoYouAre("Security Researcher")
                .lookingFor("Penetration Testing")
                .location("Delhi")
                .message("<script>alert('xss')</script><b>Bold text</b>")
                .build();

        ResponseEntity<ApiResponse<Object>> response = postContactMessage(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        // Check the persisted entity
        var messages = repository.findAll();
        var latest = messages.stream()
                .filter(m -> "xss@test.com".equals(m.getEmail()))
                .findFirst()
                .orElseThrow();

        assertThat(latest.getMessage()).doesNotContain("<script>", "<b>");
        assertThat(latest.getMessage()).contains("Bold text");
    }
}
