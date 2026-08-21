package in.lesuccess.portal.controller;

import in.lesuccess.portal.processstep.ProcessStepRepository;
import in.lesuccess.portal.serviceoffering.ServiceOfferingRepository;
import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.sitesetting.SiteSettingRepository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves V8-V10 apply cleanly on top of V1-V7 against a real MySQL, that
 * Hibernate's {@code ddl-auto: validate} accepts the resulting schema, and that
 * the seeded rows are readable over the public endpoints.
 *
 * <p>The schema check is not incidental: the H2-backed slice tests run with
 * {@code ddl-auto: create-drop}, so they generate tables from the entities and
 * would never notice a migration that disagreed with them.</p>
 *
 * <p>Requires Docker, like {@link ContactIntegrationTest}. Without a Docker
 * environment this class errors during container startup rather than failing an
 * assertion.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@Testcontainers
@ActiveProfiles("test")
class ContentIntegrationTest {

    @SuppressWarnings("resource") // lifecycle is managed by @Testcontainers/@Container
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("lesuccess_test")
            .withUsername("test")
            .withPassword("test");

    /** Same overrides as ContactIntegrationTest — see the notes there for why each is needed. */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
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
    private ProcessStepRepository processStepRepository;

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    @Autowired
    private ServiceOfferingRepository serviceOfferingRepository;

    private static final ParameterizedTypeReference<ApiResponse<List<Map<String, Object>>>> LIST_RESPONSE =
            new ParameterizedTypeReference<>() {};

    private static final ParameterizedTypeReference<ApiResponse<Map<String, String>>> MAP_RESPONSE =
            new ParameterizedTypeReference<>() {};

    @Test
    @DisplayName("V9 seeds exactly the four process steps, in order")
    void processStepsAreSeeded() {
        assertThat(processStepRepository.count()).isEqualTo(4);
        assertThat(processStepRepository.findAllByOrderByStepNumberAsc())
                .extracting("title")
                .containsExactly("Evaluate", "Customize", "Empower", "Launch");
    }

    @Test
    @DisplayName("V10 seeds the full settings key vocabulary")
    void siteSettingsAreSeeded() {
        assertThat(siteSettingRepository.count()).isEqualTo(16);
        assertThat(siteSettingRepository.findById("promo_banner_text"))
                .get()
                .extracting("value")
                .asString()
                .contains("Data Analytics Course");
    }

    @Test
    @DisplayName("V8 creates an empty service table that the entity mapping validates against")
    void serviceTableIsCreatedAndEmpty() {
        // ddl-auto: validate has already passed by the time this runs — reaching
        // this assertion at all is the schema check.
        assertThat(serviceOfferingRepository.count()).isZero();
    }

    @Test
    @DisplayName("GET /api/process-steps is public and returns the seeded rows")
    void getProcessSteps_shouldBePublic() {
        ResponseEntity<ApiResponse<List<Map<String, Object>>>> response = restTemplate.exchange(
                "/api/process-steps", HttpMethod.GET, null, LIST_RESPONSE);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(4);
    }

    @Test
    @DisplayName("GET /api/settings is public, cacheable, and returns the seeded map")
    void getSettings_shouldBePublicAndCacheable() {
        ResponseEntity<ApiResponse<Map<String, String>>> response = restTemplate.exchange(
                "/api/settings", HttpMethod.GET, null, MAP_RESPONSE);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getCacheControl()).contains("max-age=300");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).containsKey("email_primary");
    }

    @Test
    @DisplayName("GET /api/services is public and hides DRAFT rows (the table seeds empty)")
    void getServices_shouldBePublic() {
        ResponseEntity<ApiResponse<List<Map<String, Object>>>> response = restTemplate.exchange(
                "/api/services", HttpMethod.GET, null, LIST_RESPONSE);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEmpty();
    }

    @Test
    @DisplayName("Admin routes on the new modules reject anonymous callers")
    void adminRoutesRequireAuth() {
        assertThat(restTemplate.getForEntity("/api/services/1", String.class).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<String> put = restTemplate.exchange(
                "/api/settings", HttpMethod.PUT,
                new org.springframework.http.HttpEntity<>(Map.of("phone_primary", "+919000000000")),
                String.class);
        assertThat(put.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
