package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UpcomingProgramController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class UpcomingProgramControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UpcomingProgramService service;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("Admin create with isActive=true sets isActive on request")
    @WithMockUser(roles = "ADMIN")
    void create_withIsActiveTrue_deserializesCorrectly() throws Exception {
        UpcomingProgramResponse resp = UpcomingProgramResponse.builder()
                .id(1L)
                .type(UpcomingProgramType.WEBINAR)
                .title("Full Stack Web Dev")
                .topic("Modern Web")
                .eventDate(LocalDate.of(2026, 12, 1))
                .isActive(true)
                .build();

        when(service.create(any(UpcomingProgramRequest.class))).thenReturn(resp);

        String json = """
        {
            "type": "WEBINAR",
            "title": "Full Stack Web Dev",
            "topic": "Modern Web",
            "eventDate": "2026-12-01",
            "isActive": true
        }
        """;

        mockMvc.perform(post("/api/admin/upcoming-programs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andExpect(jsonPath("$.data.active").value(true));

        ArgumentCaptor<UpcomingProgramRequest> captor = ArgumentCaptor.forClass(UpcomingProgramRequest.class);
        verify(service).create(captor.capture());
        assertThat(captor.getValue().isActive()).isTrue();
    }

    @Test
    @DisplayName("Admin create with alias active=false sets isActive to false")
    @WithMockUser(roles = "ADMIN")
    void create_withActiveFalse_deserializesCorrectly() throws Exception {
        UpcomingProgramResponse resp = UpcomingProgramResponse.builder()
                .id(2L)
                .type(UpcomingProgramType.WORKSHOP)
                .title("AI Workshop")
                .topic("Generative AI")
                .eventDate(LocalDate.of(2026, 12, 5))
                .isActive(false)
                .build();

        when(service.create(any(UpcomingProgramRequest.class))).thenReturn(resp);

        String json = """
        {
            "type": "WORKSHOP",
            "title": "AI Workshop",
            "topic": "Generative AI",
            "eventDate": "2026-12-05",
            "active": false
        }
        """;

        mockMvc.perform(post("/api/admin/upcoming-programs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isActive").value(false))
                .andExpect(jsonPath("$.data.active").value(false));

        ArgumentCaptor<UpcomingProgramRequest> captor = ArgumentCaptor.forClass(UpcomingProgramRequest.class);
        verify(service).create(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    @DisplayName("Admin update existing event with past date succeeds")
    @WithMockUser(roles = "ADMIN")
    void update_pastDateEvent_succeeds() throws Exception {
        UpcomingProgramResponse resp = UpcomingProgramResponse.builder()
                .id(10L)
                .type(UpcomingProgramType.WEBINAR)
                .title("Past Event")
                .topic("Recap")
                .eventDate(LocalDate.of(2025, 1, 15))
                .isActive(true)
                .build();

        when(service.update(eq(10L), any(UpcomingProgramRequest.class))).thenReturn(resp);

        String json = """
        {
            "type": "WEBINAR",
            "title": "Past Event",
            "topic": "Recap",
            "eventDate": "2025-01-15",
            "isActive": true
        }
        """;

        mockMvc.perform(put("/api/admin/upcoming-programs/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isActive").value(true))
                .andExpect(jsonPath("$.data.active").value(true));

        ArgumentCaptor<UpcomingProgramRequest> captor = ArgumentCaptor.forClass(UpcomingProgramRequest.class);
        verify(service).update(eq(10L), captor.capture());
        assertThat(captor.getValue().getEventDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        assertThat(captor.getValue().isActive()).isTrue();
    }

    @Test
    @DisplayName("Admin listAllRegistrations returns 200 and page response")
    @WithMockUser(roles = "ADMIN")
    void listAllRegistrations_admin_returnsPage() throws Exception {
        UpcomingProgramRegistrationResponse reg = UpcomingProgramRegistrationResponse.builder()
                .id(1L)
                .programId(5L)
                .programTitle("Webinar on AI")
                .programType("WEBINAR")
                .name("Alex Smith")
                .email("alex@example.com")
                .mobileNumber("9876543210")
                .mode("ONLINE")
                .locationInfo("https://meet.google.com/xyz")
                .build();

        in.lesuccess.portal.shared.dto.PageResponse<UpcomingProgramRegistrationResponse> pageResp =
                in.lesuccess.portal.shared.dto.PageResponse.<UpcomingProgramRegistrationResponse>builder()
                        .content(java.util.List.of(reg))
                        .page(0)
                        .size(20)
                        .totalElements(1)
                        .totalPages(1)
                        .build();

        when(service.listAllRegistrations(any(), any())).thenReturn(pageResp);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/admin/upcoming-programs/registrations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].fullName").value("Alex Smith"))
                .andExpect(jsonPath("$.data.content[0].phoneNumber").value("9876543210"))
                .andExpect(jsonPath("$.data.content[0].programTitle").value("Webinar on AI"))
                .andExpect(jsonPath("$.data.content[0].programType").value("WEBINAR"))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    @DisplayName("Admin listAllRegistrations handles empty result gracefully")
    @WithMockUser(roles = "ADMIN")
    void listAllRegistrations_empty_returnsEmptyList() throws Exception {
        in.lesuccess.portal.shared.dto.PageResponse<UpcomingProgramRegistrationResponse> pageResp =
                in.lesuccess.portal.shared.dto.PageResponse.<UpcomingProgramRegistrationResponse>builder()
                        .content(java.util.Collections.emptyList())
                        .page(0)
                        .size(20)
                        .totalElements(0)
                        .totalPages(0)
                        .build();

        when(service.listAllRegistrations(any(), any())).thenReturn(pageResp);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/admin/upcoming-programs/registrations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @DisplayName("Anonymous user cannot access listAllRegistrations")
    void listAllRegistrations_anonymous_returnsForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/admin/upcoming-programs/registrations"))
                .andExpect(status().isUnauthorized());
    }
}
