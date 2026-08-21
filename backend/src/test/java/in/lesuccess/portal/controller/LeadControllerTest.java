package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.lead.LeadController;
import in.lesuccess.portal.lead.LeadRequest;
import in.lesuccess.portal.lead.LeadResponse;
import in.lesuccess.portal.lead.LeadService;
import in.lesuccess.portal.lead.LeadSource;
import in.lesuccess.portal.lead.LeadStatus;
import in.lesuccess.portal.lead.LeadStatusUpdateRequest;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LeadController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class LeadControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LeadService leadService;

    private static final String BASE_URL = "/api/leads";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Nested
    @DisplayName("POST /api/leads (public)")
    class CreateTests {

        @Test
        @DisplayName("Valid request -> 201")
        void valid_shouldReturn201() throws Exception {
            when(leadService.createLead(any(), anyString()))
                    .thenReturn(LeadService.LeadSubmitResult.success(buildResponse(1L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Honeypot -> 201 with data present and null")
        void honeypot_shouldReturn201() throws Exception {
            when(leadService.createLead(any(), anyString()))
                    .thenReturn(LeadService.LeadSubmitResult.honeypot());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data").hasJsonPath())
                    .andExpect(jsonPath("$.data").value(nullValue()));
        }

        @Test
        @DisplayName("Honeypot 201 and real 201 have identical JSON key sets")
        void honeypotAndReal_shouldHaveIdenticalShape() throws Exception {
            String body = objectMapper.writeValueAsString(buildValidRequest());

            when(leadService.createLead(any(), anyString()))
                    .thenReturn(LeadService.LeadSubmitResult.success(buildResponse(1L)));
            String real = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            when(leadService.createLead(any(), anyString()))
                    .thenReturn(LeadService.LeadSubmitResult.honeypot());
            String honeypot = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            // A bot must not be able to distinguish the two by key set.
            assertThat(topLevelKeys(honeypot)).isEqualTo(topLevelKeys(real));
        }

        private Set<String> topLevelKeys(String json) {
            Set<String> keys = new TreeSet<>();
            objectMapper.readTree(json).propertyNames().forEach(keys::add);
            return keys;
        }

        @Test
        @DisplayName("Missing required fields -> 400 with errors[]")
        void missingFields_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LeadRequest())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors").isArray())
                    .andExpect(jsonPath("$.errors[?(@.field == 'name')]").exists())
                    .andExpect(jsonPath("$.errors[?(@.field == 'mobile')]").exists())
                    .andExpect(jsonPath("$.errors[?(@.field == 'source')]").exists());
        }

        @Test
        @DisplayName("Invalid mobile -> 400")
        void invalidMobile_shouldReturn400() throws Exception {
            LeadRequest request = buildValidRequest();
            request.setMobile("12345");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'mobile')]").exists());
        }

        @Test
        @DisplayName("Mobile with spaces -> 201, normalised before the service sees it")
        void spacedMobile_shouldBeNormalized() throws Exception {
            String json = objectMapper.writeValueAsString(buildValidRequest())
                    .replace("\"+919876543210\"", "\"+91 98765 43210\"");

            when(leadService.createLead(any(), anyString()))
                    .thenReturn(LeadService.LeadSubmitResult.success(buildResponse(1L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isCreated());

            ArgumentCaptor<LeadRequest> captor = ArgumentCaptor.forClass(LeadRequest.class);
            verify(leadService).createLead(captor.capture(), anyString());
            assertThat(captor.getValue().getMobile()).isEqualTo("+919876543210");
        }

        @Test
        @DisplayName("Invalid email -> 400")
        void invalidEmail_shouldReturn400() throws Exception {
            LeadRequest request = buildValidRequest();
            request.setEmail("not-an-email");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'email')]").exists());
        }

        @Test
        @DisplayName("Unknown source constant -> 400, not 500")
        void unknownSourceConstant_shouldReturn400() throws Exception {
            String json = """
                    {"name":"Ravi","mobile":"+919876543210","source":"NOT_A_SOURCE"}""";

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON).content(json))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Source not currently accepted -> 400 naming the source field")
        void unacceptedSource_shouldReturn400() throws Exception {
            when(leadService.createLead(any(), anyString())).thenThrow(new InvalidRequestException(
                    "Validation failed",
                    List.of(InvalidRequestException.fieldError(
                            "source", "Lead source HOME_DEMO_FORM is not currently accepted"))));

            LeadRequest request = buildValidRequest();
            request.setSource(LeadSource.HOME_DEMO_FORM);

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'source')]").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/leads (admin)")
    class ListTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Admin -> 200 with paginated data")
        @WithMockUser(roles = "ADMIN")
        void admin_shouldReturn200() throws Exception {
            when(leadService.listLeads(any(), any(), any())).thenReturn(
                    PageResponse.<LeadResponse>builder()
                            .content(List.of(buildResponse(1L)))
                            .page(0).size(20).totalElements(1).totalPages(1)
                            .build());

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content").isArray());
        }

        @Test
        @DisplayName("status and source filters are passed through")
        @WithMockUser(roles = "ADMIN")
        void filters_shouldBePassedThrough() throws Exception {
            when(leadService.listLeads(any(), any(), any())).thenReturn(
                    PageResponse.<LeadResponse>builder()
                            .content(List.of()).page(0).size(20).totalElements(0).totalPages(0)
                            .build());

            mockMvc.perform(get(BASE_URL)
                            .param("status", "NEW")
                            .param("source", "SERVICE_CTA_FORM"))
                    .andExpect(status().isOk());

            verify(leadService).listLeads(eq(LeadStatus.NEW), eq(LeadSource.SERVICE_CTA_FORM), any());
        }

        @Test
        @DisplayName("Unparseable status filter -> 400, not 500")
        @WithMockUser(roles = "ADMIN")
        void invalidStatusFilter_shouldReturn400() throws Exception {
            mockMvc.perform(get(BASE_URL).param("status", "BOGUS"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/leads/{id}/status (admin)")
    class StatusUpdateTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(put(BASE_URL + "/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"CONTACTED\"}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Valid -> 200")
        @WithMockUser(roles = "ADMIN")
        void valid_shouldReturn200() throws Exception {
            LeadResponse response = buildResponse(1L);
            response.setStatus(LeadStatus.CONTACTED);
            when(leadService.updateStatus(1L, LeadStatus.CONTACTED)).thenReturn(response);

            mockMvc.perform(put(BASE_URL + "/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new LeadStatusUpdateRequest(LeadStatus.CONTACTED))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status").value("CONTACTED"));
        }

        @Test
        @DisplayName("Unknown id -> 404")
        @WithMockUser(roles = "ADMIN")
        void unknownId_shouldReturn404() throws Exception {
            when(leadService.updateStatus(eq(999L), any()))
                    .thenThrow(new ResourceNotFoundException("Lead", 999L));

            mockMvc.perform(put(BASE_URL + "/999/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"CLOSED\"}"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Invalid status value -> 400")
        @WithMockUser(roles = "ADMIN")
        void invalidStatus_shouldReturn400() throws Exception {
            mockMvc.perform(put(BASE_URL + "/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"INVALID\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    // --- Helpers ---

    private LeadRequest buildValidRequest() {
        return LeadRequest.builder()
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .email("ravi@example.com")
                .lookingFor("Corporate Training")
                .source(LeadSource.SERVICE_CTA_FORM)
                .website("")
                .build();
    }

    private LeadResponse buildResponse(Long id) {
        return LeadResponse.builder()
                .id(id)
                .name("Ravi Kumar")
                .mobile("+919876543210")
                .email("ravi@example.com")
                .lookingFor("Corporate Training")
                .source(LeadSource.SERVICE_CTA_FORM)
                .status(LeadStatus.NEW)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
