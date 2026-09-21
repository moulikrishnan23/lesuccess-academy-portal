package in.lesuccess.portal.security;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.lead.LeadController;
import in.lesuccess.portal.lead.LeadRequest;
import in.lesuccess.portal.lead.LeadResponse;
import in.lesuccess.portal.lead.LeadService;
import in.lesuccess.portal.lead.LeadSource;
import in.lesuccess.portal.lead.LeadStatus;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves the widened rate limiter actually covers {@code /api/leads}.
 *
 * <p>{@link RateLimitFilterTest} does the same for {@code /api/contact-messages}
 * — together they show the config-driven protected-path list applies to both,
 * which is the behaviour that replaced the hardcoded single path.</p>
 */
@WebMvcTest(LeadController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        RateLimitFilter.class})
@ActiveProfiles("test")
@TestPropertySource(properties = "lesuccess.rate-limit.requests-per-hour=2")
class LeadRateLimitFilterTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LeadService leadService;

    private static final String BASE_URL = "/api/leads";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(rateLimitFilter)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        when(leadService.createLead(any(), anyString()))
                .thenReturn(LeadService.LeadSubmitResult.success(buildResponse()));
    }

    /** Buckets are keyed by client IP, so each test needs its own to stay isolated. */
    private RequestPostProcessor fromIp(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    @Test
    @DisplayName("POST /api/leads is throttled once the per-IP limit is spent")
    void postLeads_shouldBeRateLimited() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post(BASE_URL).with(fromIp("198.51.100.10"))
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post(BASE_URL).with(fromIp("198.51.100.10"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Buckets are per-IP, so one spammer does not lock out everyone else")
    void limitIsPerIp() throws Exception {
        String body = objectMapper.writeValueAsString(buildValidRequest());

        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post(BASE_URL).with(fromIp("198.51.100.20"))
                    .contentType(MediaType.APPLICATION_JSON).content(body));
        }

        mockMvc.perform(post(BASE_URL).with(fromIp("198.51.100.21"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Admin GET on the same path is not throttled - POST only")
    @WithMockUser(roles = "ADMIN")
    void adminGet_shouldNotBeRateLimited() throws Exception {
        when(leadService.listLeads(any(), any(), any())).thenReturn(
                in.lesuccess.portal.shared.dto.PageResponse.<LeadResponse>builder()
                        .content(java.util.List.of()).page(0).size(20).totalElements(0).totalPages(0)
                        .build());

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get(BASE_URL).with(fromIp("198.51.100.30")))
                    .andExpect(status().isOk());
        }
    }

    private LeadRequest buildValidRequest() {
        return LeadRequest.builder()
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .source(LeadSource.SERVICE_CTA_FORM)
                .website("")
                .build();
    }

    private LeadResponse buildResponse() {
        return LeadResponse.builder()
                .id(1L)
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .source(LeadSource.SERVICE_CTA_FORM)
                .status(LeadStatus.NEW)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
