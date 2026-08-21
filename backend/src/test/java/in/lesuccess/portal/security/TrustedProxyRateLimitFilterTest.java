package in.lesuccess.portal.security;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.contact.ContactController;
import in.lesuccess.portal.contact.ContactMessageRequest;
import in.lesuccess.portal.contact.ContactMessageResponse;
import in.lesuccess.portal.contact.ContactMessageStatus;
import in.lesuccess.portal.contact.ContactService;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;

import tools.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers {@code trust-proxy} / {@code trusted-proxies}, which previously had no
 * tests at all.
 *
 * <p>These also pin the property <em>binding</em>. {@code @Value} cannot bind a
 * YAML sequence — Boot flattens a list into indexed keys and the un-indexed key
 * does not exist, so a list-formatted {@code trusted-proxies} silently resolved
 * to the empty default. That is exactly what application-prod.yml had: with
 * {@code trust-proxy: true} but an empty effective proxy list, X-Forwarded-For
 * was never honoured and every client behind the load balancer shared a single
 * bucket keyed on the proxy's own IP. {@link #trustedProxy_shouldHonorForwardedFor}
 * fails if that regression returns.</p>
 */
@WebMvcTest(ContactController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        RateLimitFilter.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "lesuccess.rate-limit.requests-per-hour=2",
        "lesuccess.rate-limit.trust-proxy=true",
        "lesuccess.rate-limit.trusted-proxies=10.0.0.1,10.0.0.2"
})
class TrustedProxyRateLimitFilterTest {

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

    private String body;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(rateLimitFilter)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        when(contactService.createContactMessage(any(), anyString()))
                .thenReturn(ContactService.ContactSubmitResult.success(buildResponse()));

        body = objectMapper.writeValueAsString(buildValidRequest());
    }

    private RequestPostProcessor from(String remoteAddr, String forwardedFor) {
        return request -> {
            request.setRemoteAddr(remoteAddr);
            if (forwardedFor != null) {
                request.addHeader("X-Forwarded-For", forwardedFor);
            }
            return request;
        };
    }

    private void submit(String remoteAddr, String forwardedFor, int expectedStatus) throws Exception {
        mockMvc.perform(post(BASE_URL).with(from(remoteAddr, forwardedFor))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().is(expectedStatus));
    }

    @Test
    @DisplayName("Trusted proxy: buckets follow X-Forwarded-For, not the proxy's own IP")
    void trustedProxy_shouldHonorForwardedFor() throws Exception {
        // Spend one client's allowance through the trusted proxy.
        submit("10.0.0.1", "203.0.113.5", 201);
        submit("10.0.0.1", "203.0.113.5", 201);
        submit("10.0.0.1", "203.0.113.5", 429);

        // A different real client, same proxy, must still get through. If the
        // forwarded header were ignored, this would share the proxy's exhausted
        // bucket and 429 — the production symptom this test exists to catch.
        submit("10.0.0.1", "203.0.113.6", 201);
    }

    @Test
    @DisplayName("Second configured proxy is trusted too, proving the list parsed as a list")
    void secondTrustedProxy_shouldAlsoBeHonored() throws Exception {
        // Reaches 10.0.0.2 only if the comma-separated value split into two entries
        // rather than binding as one literal string.
        submit("10.0.0.2", "203.0.113.7", 201);
        submit("10.0.0.2", "203.0.113.7", 201);
        submit("10.0.0.2", "203.0.113.7", 429);

        submit("10.0.0.2", "203.0.113.8", 201);
    }

    @Test
    @DisplayName("Untrusted caller: X-Forwarded-For is ignored, so it cannot be spoofed")
    void untrustedCaller_shouldIgnoreForwardedFor() throws Exception {
        // Every request claims a different origin, but 192.168.50.1 is not a
        // trusted proxy, so all three share one bucket keyed on remoteAddr.
        submit("192.168.50.1", "203.0.113.100", 201);
        submit("192.168.50.1", "203.0.113.101", 201);
        submit("192.168.50.1", "203.0.113.102", 429);
    }

    @Test
    @DisplayName("Trusted proxy with no forwarded header falls back to remoteAddr")
    void trustedProxyWithoutHeader_shouldFallBackToRemoteAddr() throws Exception {
        submit("10.0.0.1", null, 201);
        submit("10.0.0.1", null, 201);
        submit("10.0.0.1", null, 429);
    }

    // --- Helpers ---

    private ContactMessageRequest buildValidRequest() {
        return ContactMessageRequest.builder()
                .name("Ravi Kumar")
                .email("ravi@example.com")
                .phone("+919876543210")
                .whoYouAre("Student")
                .lookingFor("UPSC Coaching")
                .location("Chennai")
                .message("Checking proxy-aware rate limiting.")
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
                .message("Checking proxy-aware rate limiting.")
                .status(ContactMessageStatus.NEW)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
