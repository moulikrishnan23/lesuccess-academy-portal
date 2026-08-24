package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.serviceoffering.ServiceCategory;
import in.lesuccess.portal.serviceoffering.ServiceOfferingController;
import in.lesuccess.portal.serviceoffering.ServiceOfferingRequest;
import in.lesuccess.portal.serviceoffering.ServiceOfferingResponse;
import in.lesuccess.portal.serviceoffering.ServiceOfferingService;
import in.lesuccess.portal.serviceoffering.ServiceStatus;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ServiceOfferingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class ServiceOfferingControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ServiceOfferingService service;

    private static final String BASE_URL = "/api/services";

    /** See ContactControllerTest: without springSecurity(), @WithMockUser never reaches the request. */
    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Nested
    @DisplayName("GET /api/services (public)")
    class ListTests {

        @Test
        @DisplayName("No auth -> 200, this is a public read")
        void noAuth_shouldReturn200() throws Exception {
            when(service.listPublished(null)).thenReturn(List.of(buildResponse(1L)));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].id").value(1));
        }

        @Test
        @DisplayName("category filter is passed through to the service")
        void categoryFilter_shouldBePassedThrough() throws Exception {
            when(service.listPublished(ServiceCategory.CORPORATE)).thenReturn(List.of());

            mockMvc.perform(get(BASE_URL).param("category", "CORPORATE"))
                    .andExpect(status().isOk());

            verify(service).listPublished(ServiceCategory.CORPORATE);
        }

        @Test
        @DisplayName("Unparseable category -> 400, not 500")
        void invalidCategory_shouldReturn400() throws Exception {
            mockMvc.perform(get(BASE_URL).param("category", "BOGUS"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("GET /api/services/{id} (admin)")
    class GetByIdTests {

        @Test
        @DisplayName("No auth -> 401 (this route exposes DRAFT rows)")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get(BASE_URL + "/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(get(BASE_URL + "/1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Admin -> 200")
        @WithMockUser(roles = "ADMIN")
        void admin_shouldReturn200() throws Exception {
            when(service.getById(1L)).thenReturn(buildResponse(1L));

            mockMvc.perform(get(BASE_URL + "/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Unknown id -> 404")
        @WithMockUser(roles = "ADMIN")
        void unknownId_shouldReturn404() throws Exception {
            when(service.getById(999L)).thenThrow(new ResourceNotFoundException("Service", 999L));

            mockMvc.perform(get(BASE_URL + "/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/services (admin)")
    class CreateTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Valid request -> 201")
        @WithMockUser(roles = "ADMIN")
        void valid_shouldReturn201() throws Exception {
            when(service.create(any())).thenReturn(buildResponse(1L));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Missing required fields -> 400 with errors[]")
        @WithMockUser(roles = "ADMIN")
        void missingFields_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new ServiceOfferingRequest())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors").isArray())
                    .andExpect(jsonPath("$.errors[?(@.field == 'title')]").exists())
                    .andExpect(jsonPath("$.errors[?(@.field == 'category')]").exists());
        }

        @Test
        @DisplayName("Unknown category constant -> 400")
        @WithMockUser(roles = "ADMIN")
        void unknownCategory_shouldReturn400() throws Exception {
            String json = """
                    {"category":"BOGUS","title":"T","description":"D","displayOrder":0}""";

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/services/{id} (admin)")
    class UpdateTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Valid -> 200")
        @WithMockUser(roles = "MANAGER")
        void valid_shouldReturn200() throws Exception {
            when(service.update(eq(1L), any())).thenReturn(buildResponse(1L));

            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Unknown id -> 404")
        @WithMockUser(roles = "ADMIN")
        void unknownId_shouldReturn404() throws Exception {
            when(service.update(eq(999L), any()))
                    .thenThrow(new ResourceNotFoundException("Service", 999L));

            mockMvc.perform(put(BASE_URL + "/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Blank title -> 400")
        @WithMockUser(roles = "ADMIN")
        void blankTitle_shouldReturn400() throws Exception {
            ServiceOfferingRequest request = buildValidRequest();
            request.setTitle("   ");

            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'title')]").exists());
        }
    }

    @Nested
    @DisplayName("DELETE /api/services/{id} (admin)")
    class DeleteTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Existing id -> 204, no body")
        @WithMockUser(roles = "ADMIN")
        void existingId_shouldReturn204() throws Exception {
            doNothing().when(service).softDelete(1L);

            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
        }

        @Test
        @DisplayName("Unknown id -> 404")
        @WithMockUser(roles = "ADMIN")
        void unknownId_shouldReturn404() throws Exception {
            doThrow(new ResourceNotFoundException("Service", 999L)).when(service).softDelete(999L);

            mockMvc.perform(delete(BASE_URL + "/999"))
                    .andExpect(status().isNotFound());
        }
    }

    // --- Helpers ---

    private ServiceOfferingRequest buildValidRequest() {
        return ServiceOfferingRequest.builder()
                .category(ServiceCategory.INSTITUTION)
                .title("For Institutions")
                .description("Campus training programmes built around your placement targets.")
                .iconUrl("/icons/institution.svg")
                .status(ServiceStatus.PUBLISHED)
                .displayOrder(1)
                .build();
    }

    private ServiceOfferingResponse buildResponse(Long id) {
        return ServiceOfferingResponse.builder()
                .id(id)
                .category(ServiceCategory.INSTITUTION)
                .title("For Institutions")
                .description("Campus training programmes built around your placement targets.")
                .iconUrl("/icons/institution.svg")
                .status(ServiceStatus.PUBLISHED)
                .displayOrder(1)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
