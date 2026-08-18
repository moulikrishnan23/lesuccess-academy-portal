package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.dto.ContactMessageRequest;
import in.lesuccess.portal.dto.ContactMessageResponse;
import in.lesuccess.portal.dto.ContactMessageStatusUpdateRequest;
import in.lesuccess.portal.dto.PageResponse;
import in.lesuccess.portal.exception.GlobalExceptionHandler;
import in.lesuccess.portal.model.ContactMessageStatus;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.service.ContactService;

import tools.jackson.databind.ObjectMapper;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContactController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class ContactControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Build MockMvc with springSecurity() explicitly.
     * Without it the security filter chain still runs, but @WithMockUser's context
     * is never bridged into the request — SecurityContextHolderFilter loads an empty
     * context (the chain is STATELESS, so there is no repository to restore from) and
     * AnonymousAuthenticationFilter fills in, making every authenticated route 401.
     */
    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @MockitoBean
    private ContactService contactService;

    private static final String BASE_URL = "/api/contact-messages";

    @Nested
    @DisplayName("POST /api/contact-messages (public)")
    class CreateTests {

        @Test
        @DisplayName("Valid request → 201")
        void validRequest_shouldReturn201() throws Exception {
            ContactMessageRequest request = buildValidRequest();
            ContactMessageResponse response = buildResponse(1L);

            when(contactService.createContactMessage(any(), anyString()))
                    .thenReturn(ContactService.ContactSubmitResult.success(response));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Honeypot triggered → 201 (identical shape, no data)")
        void honeypotTriggered_shouldReturn201() throws Exception {
            ContactMessageRequest request = buildValidRequest();
            request.setWebsite("http://bot-spam.com");

            when(contactService.createContactMessage(any(), anyString()))
                    .thenReturn(ContactService.ContactSubmitResult.honeypot());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    // The key must be PRESENT and null — not absent. See the shape test below.
                    .andExpect(jsonPath("$.data").hasJsonPath())
                    .andExpect(jsonPath("$.data").value(nullValue()));
        }

        @Test
        @DisplayName("Honeypot 201 and real 201 have identical JSON key sets")
        void honeypotAndRealSuccess_shouldHaveIdenticalShape() throws Exception {
            ContactMessageRequest request = buildValidRequest();

            when(contactService.createContactMessage(any(), anyString()))
                    .thenReturn(ContactService.ContactSubmitResult.success(buildResponse(1L)));
            String realBody = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            when(contactService.createContactMessage(any(), anyString()))
                    .thenReturn(ContactService.ContactSubmitResult.honeypot());
            String honeypotBody = mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            // Compare structure, not values — a bot must not be able to tell these apart
            // by which keys are present.
            assertThat(topLevelKeys(honeypotBody)).isEqualTo(topLevelKeys(realBody));
        }

        private Set<String> topLevelKeys(String json) {
            Set<String> keys = new TreeSet<>();
            objectMapper.readTree(json).propertyNames().forEach(keys::add);
            return keys;
        }

        @Test
        @DisplayName("Missing required fields → 400 with errors[]")
        void missingFields_shouldReturn400() throws Exception {
            ContactMessageRequest request = new ContactMessageRequest();

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errors").isArray())
                    .andExpect(jsonPath("$.errors").isNotEmpty());
        }

        @Test
        @DisplayName("Invalid email → 400")
        void invalidEmail_shouldReturn400() throws Exception {
            ContactMessageRequest request = buildValidRequest();
            request.setEmail("not-an-email");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'email')]").exists());
        }

        @Test
        @DisplayName("Frontend-formatted phone with spaces → 201, stripped before validation")
        void phoneWithSpaces_shouldBeAcceptedAndStripped() throws Exception {
            // Raw JSON, so this goes through Jackson binding exactly as a browser would.
            String json = objectMapper.writeValueAsString(buildValidRequest())
                    .replace("\"+919876543210\"", "\"+91 98765 43210\"");

            when(contactService.createContactMessage(any(), anyString()))
                    .thenReturn(ContactService.ContactSubmitResult.success(buildResponse(1L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json))
                    .andExpect(status().isCreated());

            // And the service must receive the normalised value, not the spaced one.
            ArgumentCaptor<ContactMessageRequest> captor =
                    ArgumentCaptor.forClass(ContactMessageRequest.class);
            verify(contactService).createContactMessage(captor.capture(), anyString());
            assertThat(captor.getValue().getPhone()).isEqualTo("+919876543210");
        }

        @Test
        @DisplayName("Invalid phone → 400")
        void invalidPhone_shouldReturn400() throws Exception {
            ContactMessageRequest request = buildValidRequest();
            request.setPhone("12345");

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[?(@.field == 'phone')]").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/contact-messages (admin)")
    class ListTests {

        @Test
        @DisplayName("No auth → 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role → 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Admin role → 200 with paginated data")
        @WithMockUser(roles = "ADMIN")
        void adminRole_shouldReturn200() throws Exception {
            PageResponse<ContactMessageResponse> pageResponse = PageResponse.<ContactMessageResponse>builder()
                    .content(List.of(buildResponse(1L)))
                    .page(0)
                    .size(20)
                    .totalElements(1)
                    .totalPages(1)
                    .build();

            when(contactService.listContactMessages(any(), any(), any()))
                    .thenReturn(pageResponse);

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content").isArray());
        }

        @Test
        @DisplayName("Unparseable status filter → 400, not 500")
        @WithMockUser(roles = "ADMIN")
        void invalidStatusFilter_shouldReturn400() throws Exception {
            // MethodArgumentTypeMismatchException — without an explicit handler this
            // falls through to @ExceptionHandler(Exception.class) and returns 500.
            mockMvc.perform(get(BASE_URL).param("status", "BOGUS"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("CONTENT_ADMIN role → 200")
        @WithMockUser(roles = "CONTENT_ADMIN")
        void contentAdminRole_shouldReturn200() throws Exception {
            PageResponse<ContactMessageResponse> pageResponse = PageResponse.<ContactMessageResponse>builder()
                    .content(List.of())
                    .page(0).size(20).totalElements(0).totalPages(0)
                    .build();

            when(contactService.listContactMessages(any(), any(), any()))
                    .thenReturn(pageResponse);

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/contact-messages/{id} (admin)")
    class GetByIdTests {

        @Test
        @DisplayName("Existing ID → 200")
        @WithMockUser(roles = "ADMIN")
        void existingId_shouldReturn200() throws Exception {
            when(contactService.getContactMessage(1L)).thenReturn(buildResponse(1L));

            mockMvc.perform(get(BASE_URL + "/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Non-existent ID → 404")
        @WithMockUser(roles = "ADMIN")
        void nonExistentId_shouldReturn404() throws Exception {
            when(contactService.getContactMessage(999L))
                    .thenThrow(new in.lesuccess.portal.exception.ResourceNotFoundException("Contact message", 999L));

            mockMvc.perform(get(BASE_URL + "/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }

    @Nested
    @DisplayName("PUT /api/contact-messages/{id}/status (admin)")
    class StatusUpdateTests {

        @Test
        @DisplayName("Valid status update → 200")
        @WithMockUser(roles = "ADMIN")
        void validUpdate_shouldReturn200() throws Exception {
            ContactMessageStatusUpdateRequest req = new ContactMessageStatusUpdateRequest(ContactMessageStatus.READ);
            ContactMessageResponse response = buildResponse(1L);
            response.setStatus(ContactMessageStatus.READ);

            when(contactService.updateStatus(eq(1L), eq(ContactMessageStatus.READ)))
                    .thenReturn(response);

            mockMvc.perform(put(BASE_URL + "/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status").value("READ"));
        }

        @Test
        @DisplayName("Invalid status value → 400")
        @WithMockUser(roles = "ADMIN")
        void invalidStatus_shouldReturn400() throws Exception {
            // Jackson will fail to deserialize "INVALID" into ContactMessageStatus enum
            mockMvc.perform(put(BASE_URL + "/1/status")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"INVALID\"}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/contact-messages/{id} (admin)")
    class DeleteTests {

        @Test
        @DisplayName("Existing ID → 204, no body")
        @WithMockUser(roles = "ADMIN")
        void existingId_shouldReturn204() throws Exception {
            doNothing().when(contactService).softDelete(1L);

            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
        }

        @Test
        @DisplayName("No auth → 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/1"))
                    .andExpect(status().isUnauthorized());
        }
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
                .message("I want to learn more about your courses.")
                .website("")
                .build();
    }

    private ContactMessageResponse buildResponse(Long id) {
        return ContactMessageResponse.builder()
                .id(id)
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
