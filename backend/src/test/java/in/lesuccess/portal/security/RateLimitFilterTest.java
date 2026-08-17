package in.lesuccess.portal.security;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.controller.ContactController;
import in.lesuccess.portal.dto.ContactMessageRequest;
import in.lesuccess.portal.dto.ContactMessageResponse;
import in.lesuccess.portal.exception.GlobalExceptionHandler;
import in.lesuccess.portal.model.ContactMessageStatus;
import in.lesuccess.portal.service.ContactService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the 429 path of {@link RateLimitFilter} over real HTTP.
 * <p>
 * The limit is lowered to 2 for this class only via @TestPropertySource — the
 * shared application-test.yml default of 100 stays untouched for every other test.
 */
@WebMvcTest(ContactController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        RateLimitFilter.class})
@ActiveProfiles("test")
@TestPropertySource(properties = "lesuccess.rate-limit.requests-per-hour=2")
class RateLimitFilterTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContactService contactService;

    private static final String BASE_URL = "/api/contact-messages";

    @BeforeEach
    void setUp() {
        // The filter must be registered explicitly — webAppContextSetup does not
        // pick up Filter beans the way Boot's auto-configured MockMvc does.
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(rateLimitFilter)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        when(contactService.createContactMessage(any(), anyString()))
                .thenReturn(ContactService.ContactSubmitResult.success(buildResponse()));
    }

    /**
     * Buckets are keyed by client IP and live in a Caffeine cache on the singleton
     * filter bean, so they survive across test methods sharing this context. Each
     * test therefore uses its own source IP to get a fresh bucket.
     */
    private RequestPostProcessor fromIp(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    @Test
    @DisplayName("Requests past the hourly limit → 429 with the standard ApiResponse error shape")
    void exceedingLimit_shouldReturn429() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());
        RequestPostProcessor ip = fromIp("203.0.113.10");

        // Limit is 2/hour — these two consume the bucket.
        for (int i = 1; i <= 2; i++) {
            mockMvc.perform(post(BASE_URL).with(ip)
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated());
        }

        // The third must be rejected by the filter, before the controller runs.
        mockMvc.perform(post(BASE_URL).with(ip)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Too many requests. Please try again later."));
    }

    @Test
    @DisplayName("A different client IP gets its own bucket")
    void separateIp_shouldNotShareBucket() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        // Exhaust one client's bucket.
        for (int i = 1; i <= 3; i++) {
            mockMvc.perform(post(BASE_URL).with(fromIp("203.0.113.20"))
                    .contentType(MediaType.APPLICATION_JSON).content(body));
        }

        // A different IP must still be served.
        mockMvc.perform(post(BASE_URL).with(fromIp("203.0.113.21"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Admin GET on the same path is not rate-limited")
    void getOnSamePath_shouldNotConsumeBucket() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());
        RequestPostProcessor ip = fromIp("203.0.113.30");

        // Exhaust the POST bucket for this IP.
        for (int i = 1; i <= 3; i++) {
            mockMvc.perform(post(BASE_URL).with(ip)
                    .contentType(MediaType.APPLICATION_JSON).content(body));
        }

        // A GET from the same IP must not be throttled — it should reach the security
        // layer and be rejected for missing auth (401), never 429.
        mockMvc.perform(get(BASE_URL).with(ip))
                .andExpect(status().isUnauthorized());
    }

    private ContactMessageRequest buildValidRequest() {
        return ContactMessageRequest.builder()
                .name("Ravi Kumar")
                .email("ravi@example.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("UPSC Coaching")
                .location("Chennai")
                .message("I want to learn more about your courses.")
                .website("")
                .build();
    }

    private ContactMessageResponse buildResponse() {
        return ContactMessageResponse.builder()
                .id(1L)
                .name("Ravi Kumar")
                .email("ravi@example.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("UPSC Coaching")
                .location("Chennai")
                .message("I want to learn more about your courses.")
                .status(ContactMessageStatus.NEW)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
