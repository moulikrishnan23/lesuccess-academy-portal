package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.connectwithus.ConnectWithUsController;
import in.lesuccess.portal.connectwithus.ConnectWithUsRequest;
import in.lesuccess.portal.connectwithus.ConnectWithUsResponse;
import in.lesuccess.portal.connectwithus.ConnectWithUsService;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;

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
import org.springframework.data.domain.Pageable;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer contract for {@code /api/connect-with-us}, mirroring
 * {@code CourseEnquiryControllerTest}: the real {@link SecurityConfig} is
 * imported rather than stubbed, so these tests prove the route's public/admin
 * split as configured, not as intended.
 */
@WebMvcTest(ConnectWithUsController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class ConnectWithUsControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ConnectWithUsService service;

    private static final String BASE_URL = "/api/connect-with-us";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private static ConnectWithUsRequest.ConnectWithUsRequestBuilder validRequest() {
        return ConnectWithUsRequest.builder()
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com");
    }

    private static ConnectWithUsResponse response(Long id) {
        return ConnectWithUsResponse.builder()
                .id(id)
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .createdAt(LocalDateTime.of(2026, 9, 16, 10, 30, 0))
                .build();
    }

    @Nested
    @DisplayName("POST /api/connect-with-us (public)")
    class CreateTests {

        @Test
        @DisplayName("Valid request -> 201, no auth needed")
        void valid_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(ConnectWithUsService.ConnectWithUsSubmitResult.success(response(1L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest().build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.name").value("Divya Ramesh"));
        }

        /**
         * The DTO requires only name and mobile even though the Home form's own
         * client-side guard also insists on an email — see the note on
         * {@code ConnectWithUsRequest.email}.
         */
        @Test
        @DisplayName("Only name and mobile are required by the API")
        void minimalRequest_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(ConnectWithUsService.ConnectWithUsSubmitResult.success(response(2L)));

            ConnectWithUsRequest request = ConnectWithUsRequest.builder()
                    .name("Karthik S")
                    .mobile("9003344556")
                    .build();

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Missing name -> 400")
        void missingName_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().name("  ").build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("Missing mobile -> 400")
        void missingMobile_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobile(null).build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("Malformed mobile -> 400")
        void malformedMobile_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobile("12345").build())))
                    .andExpect(status().isBadRequest());
        }

        /** A 10-digit number must start 6-9: 5xxxxxxxxx is not an Indian mobile. */
        @Test
        @DisplayName("Ten digits starting with 5 -> 400")
        void mobileWithBadLeadingDigit_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobile("5884455667").build())))
                    .andExpect(status().isBadRequest());
        }

        /**
         * Email is optional, but a value that is present must be well-formed —
         * otherwise the counsellor gets an address that cannot be written to.
         */
        @Test
        @DisplayName("Present-but-invalid email -> 400")
        void invalidEmail_shouldReturn400() throws Exception {
            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().email("not-an-email").build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        /** A honeypot hit must be indistinguishable from a genuine submission. */
        @Test
        @DisplayName("Honeypot hit -> same 201 shape, no data leaked back")
        void honeypot_shouldLookIdentical() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(ConnectWithUsService.ConnectWithUsSubmitResult.honeypot());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().website("http://spam.example").build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }

        @Test
        @DisplayName("Whitespace in the mobile number is normalised before the service sees it")
        void mobileIsNormalised() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(ConnectWithUsService.ConnectWithUsSubmitResult.success(response(3L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobile("+91 98844 55667").build())))
                    .andExpect(status().isCreated());

            ArgumentCaptor<ConnectWithUsRequest> captor =
                    ArgumentCaptor.forClass(ConnectWithUsRequest.class);
            verify(service).create(captor.capture(), anyString());

            assertThat(captor.getValue().getMobile()).isEqualTo("+919884455667");
        }
    }

    @Nested
    @DisplayName("GET /api/connect-with-us (admin)")
    class ListTests {

        @Test
        @DisplayName("No authentication -> 401")
        void unauthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Authenticated but not ADMIN/MANAGER -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN -> 200 with a paginated envelope")
        @WithMockUser(roles = "ADMIN")
        void admin_shouldReturnPagedResults() throws Exception {
            when(service.list(isNull(), any(Pageable.class)))
                    .thenReturn(PageResponse.<ConnectWithUsResponse>builder()
                            .content(List.of(response(1L)))
                            .page(0)
                            .size(20)
                            .totalElements(1)
                            .totalPages(1)
                            .build());

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content[0].id").value(1))
                    .andExpect(jsonPath("$.data.page").value(0))
                    .andExpect(jsonPath("$.data.size").value(20))
                    .andExpect(jsonPath("$.data.totalElements").value(1));
        }

        @Test
        @DisplayName("MANAGER is allowed too — managers work these enquiries")
        @WithMockUser(roles = "MANAGER")
        void manager_shouldBeAllowed() throws Exception {
            when(service.list(isNull(), any(Pageable.class)))
                    .thenReturn(PageResponse.<ConnectWithUsResponse>builder()
                            .content(List.of())
                            .page(0).size(20).totalElements(0).totalPages(0)
                            .build());

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Paging, sorting and search reach the service as given")
        @WithMockUser(roles = "ADMIN")
        void queryParamsArePassedThrough() throws Exception {
            when(service.list(eq("divya"), any(Pageable.class)))
                    .thenReturn(PageResponse.<ConnectWithUsResponse>builder()
                            .content(List.of(response(1L)))
                            .page(2).size(5).totalElements(11).totalPages(3)
                            .build());

            mockMvc.perform(get(BASE_URL)
                            .param("search", "divya")
                            .param("page", "2")
                            .param("size", "5")
                            .param("sortBy", "createdAt")
                            .param("sortDir", "asc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.page").value(2));

            ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
            verify(service).list(eq("divya"), pageable.capture());

            assertThat(pageable.getValue().getPageNumber()).isEqualTo(2);
            assertThat(pageable.getValue().getPageSize()).isEqualTo(5);
            assertThat(pageable.getValue().getSort().getOrderFor("createdAt")).isNotNull();
            assertThat(pageable.getValue().getSort().getOrderFor("createdAt").isAscending()).isTrue();
        }
    }
}
