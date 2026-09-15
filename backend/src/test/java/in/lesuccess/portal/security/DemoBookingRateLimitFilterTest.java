package in.lesuccess.portal.security;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.demobooking.DemoBookingController;
import in.lesuccess.portal.demobooking.DemoBookingRequest;
import in.lesuccess.portal.demobooking.DemoBookingResponse;
import in.lesuccess.portal.demobooking.DemoBookingService;
import in.lesuccess.portal.demobooking.DemoBookingStatus;
import in.lesuccess.portal.shared.dto.PageResponse;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves the rate limiter now covers {@code /api/demo-bookings}.
 *
 * <p>Mirrors {@link LeadRateLimitFilterTest} and {@link RateLimitFilterTest},
 * which do the same for {@code /api/leads} and {@code /api/contact-messages}.
 * This endpoint was the one public form missing from
 * {@code lesuccess.rate-limit.protected-paths}, so an unauthenticated caller
 * could POST it without limit.</p>
 */
@WebMvcTest(DemoBookingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        RateLimitFilter.class})
@ActiveProfiles("test")
@TestPropertySource(properties = "lesuccess.rate-limit.requests-per-hour=2")
class DemoBookingRateLimitFilterTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DemoBookingService service;

    private static final String PUBLIC_URL = "/api/demo-bookings";
    private static final String ADMIN_URL = "/api/admin/demo-bookings";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(rateLimitFilter)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        when(service.create(any(), anyString()))
                .thenReturn(DemoBookingService.DemoBookingSubmitResult.success(buildResponse()));
    }

    /** Buckets are keyed by client IP, so each test needs its own to stay isolated. */
    private RequestPostProcessor fromIp(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    @Test
    @DisplayName("POST /api/demo-bookings is throttled once the per-IP limit is spent")
    void postDemoBookings_shouldBeRateLimited() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post(PUBLIC_URL).with(fromIp("198.51.100.40"))
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post(PUBLIC_URL).with(fromIp("198.51.100.40"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Buckets are per-IP, so one spammer does not lock out everyone else")
    void limitIsPerIp() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post(PUBLIC_URL).with(fromIp("198.51.100.41"))
                    .contentType(MediaType.APPLICATION_JSON).content(body));
        }

        mockMvc.perform(post(PUBLIC_URL).with(fromIp("198.51.100.42"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    /**
     * The admin listing lives under a different path prefix entirely
     * (/api/admin/demo-bookings), so it was never in scope for the filter — but
     * asserting it keeps a future prefix-match refactor from throttling staff.
     */
    @Test
    @DisplayName("Admin GET is not throttled")
    @WithMockUser(roles = "ADMIN")
    void adminGet_shouldNotBeRateLimited() throws Exception {
        when(service.listAll(any(), any())).thenReturn(
                PageResponse.<DemoBookingResponse>builder()
                        .content(List.of()).page(0).size(20).totalElements(0).totalPages(0)
                        .build());

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get(ADMIN_URL).with(fromIp("198.51.100.43")))
                    .andExpect(status().isOk());
        }
    }

    private DemoBookingRequest buildValidRequest() {
        return DemoBookingRequest.builder()
                .courseName("Data Analytics")
                .mobileNumber("+919876543210")
                .website("")
                .build();
    }

    private DemoBookingResponse buildResponse() {
        return DemoBookingResponse.builder()
                .id(1L)
                .courseName("Data Analytics")
                .mobileNumber("+919876543210")
                .status(DemoBookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
