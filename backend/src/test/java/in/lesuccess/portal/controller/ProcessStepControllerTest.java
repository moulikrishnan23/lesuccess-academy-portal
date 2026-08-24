package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.processstep.ProcessStepController;
import in.lesuccess.portal.processstep.ProcessStepRequest;
import in.lesuccess.portal.processstep.ProcessStepResponse;
import in.lesuccess.portal.processstep.ProcessStepService;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProcessStepController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class ProcessStepControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProcessStepService service;

    private static final String BASE_URL = "/api/process-steps";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Nested
    @DisplayName("GET /api/process-steps (public)")
    class ListTests {

        @Test
        @DisplayName("No auth -> 200 with the four steps in order")
        void noAuth_shouldReturn200() throws Exception {
            when(service.listAll()).thenReturn(List.of(
                    buildResponse(1L, 1, "Evaluate"),
                    buildResponse(2L, 2, "Customize"),
                    buildResponse(3L, 3, "Empower"),
                    buildResponse(4L, 4, "Launch")));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data[0].title").value("Evaluate"))
                    .andExpect(jsonPath("$.data[3].title").value("Launch"));
        }
    }

    @Nested
    @DisplayName("PUT /api/process-steps/{id} (admin)")
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
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Valid -> 200")
        @WithMockUser(roles = "ADMIN")
        void valid_shouldReturn200() throws Exception {
            when(service.update(eq(1L), any())).thenReturn(buildResponse(1L, 1, "Evaluate"));

            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title").value("Evaluate"));
        }

        @Test
        @DisplayName("Unknown id -> 404")
        @WithMockUser(roles = "ADMIN")
        void unknownId_shouldReturn404() throws Exception {
            when(service.update(eq(999L), any()))
                    .thenThrow(new ResourceNotFoundException("Process step", 999L));

            mockMvc.perform(put(BASE_URL + "/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("stepNumber out of the 1-4 range -> 400")
        @WithMockUser(roles = "ADMIN")
        void stepNumberOutOfRange_shouldReturn400() throws Exception {
            ProcessStepRequest request = buildValidRequest();
            request.setStepNumber(7);

            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'stepNumber')]").exists());
        }

        @Test
        @DisplayName("Blank title -> 400")
        @WithMockUser(roles = "ADMIN")
        void blankTitle_shouldReturn400() throws Exception {
            ProcessStepRequest request = buildValidRequest();
            request.setTitle("  ");

            mockMvc.perform(put(BASE_URL + "/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'title')]").exists());
        }
    }

    @Nested
    @DisplayName("Unsupported methods")
    class UnsupportedMethodTests {

        @Test
        @DisplayName("POST is not exposed - the four steps are a fixed set")
        @WithMockUser(roles = "ADMIN")
        void post_shouldNotBeAllowed() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(buildValidRequest())))
                    .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("DELETE is not exposed")
        @WithMockUser(roles = "ADMIN")
        void delete_shouldNotBeAllowed() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isMethodNotAllowed());
        }
    }

    // --- Helpers ---

    private ProcessStepRequest buildValidRequest() {
        return ProcessStepRequest.builder()
                .stepNumber(1)
                .title("Evaluate")
                .description("We start by understanding where you stand.")
                .iconUrl("/icons/evaluate.svg")
                .build();
    }

    private ProcessStepResponse buildResponse(Long id, int stepNumber, String title) {
        return ProcessStepResponse.builder()
                .id(id)
                .stepNumber(stepNumber)
                .title(title)
                .description("Description for " + title + ".")
                .iconUrl("/icons/" + title.toLowerCase() + ".svg")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
