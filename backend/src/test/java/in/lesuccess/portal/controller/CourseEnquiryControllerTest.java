package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.courseenquiry.CourseEnquiryController;
import in.lesuccess.portal.courseenquiry.CourseEnquiryRequest;
import in.lesuccess.portal.courseenquiry.CourseEnquiryResponse;
import in.lesuccess.portal.courseenquiry.CourseEnquiryService;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.dto.PageResponse;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import in.lesuccess.portal.shared.exception.InvalidRequestException;

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
 * Web-layer contract for {@code /api/course-enquiries}, mirroring
 * {@code LeadControllerTest}: the real {@link SecurityConfig} is imported rather
 * than stubbed, so these tests prove the route's public/admin split as
 * configured, not as intended.
 */
@WebMvcTest(CourseEnquiryController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class CourseEnquiryControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CourseEnquiryService service;

    private static final String BASE_URL = "/api/course-enquiries";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private static CourseEnquiryRequest.CourseEnquiryRequestBuilder validRequest() {
        return CourseEnquiryRequest.builder()
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .location("Chennai")
                .courseId(3L)
                .currentStatus("Working Professional");
    }

    private static CourseEnquiryResponse response(Long id) {
        return CourseEnquiryResponse.builder()
                .id(id)
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .location("Chennai")
                .courseId(3L)
                .currentStatus("Working Professional")
                .createdAt(LocalDateTime.of(2026, 9, 12, 11, 4, 9))
                .build();
    }

    @Nested
    @DisplayName("POST /api/course-enquiries (public)")
    class CreateTests {

        @Test
        @DisplayName("Valid request -> 201, no auth needed")
        void valid_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(CourseEnquiryService.CourseEnquirySubmitResult.success(response(1L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest().build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.currentStatus").value("Working Professional"));
        }

        @Test
        @DisplayName("Only name and mobile are required")
        void minimalRequest_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(CourseEnquiryService.CourseEnquirySubmitResult.success(response(2L)));

            CourseEnquiryRequest request = CourseEnquiryRequest.builder()
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

        /**
         * The existence check needs a repository, so it is a service-layer
         * rejection rather than an annotation — but it must reach the client in
         * the same {@code errors[]} shape as a Bean Validation failure, since the
         * modal maps field errors straight onto its inputs.
         */
        @Test
        @DisplayName("Nonexistent courseId -> 400 with a courseId field error")
        void nonexistentCourse_shouldReturn400() throws Exception {
            when(service.create(any(), anyString()))
                    .thenThrow(new InvalidRequestException("Validation failed", List.of(
                            InvalidRequestException.fieldError("courseId", "Course 999 does not exist"))));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().courseId(999L).build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errors[0].field").value("courseId"));
        }

        /** A honeypot hit must be indistinguishable from a genuine submission. */
        @Test
        @DisplayName("Honeypot hit -> same 201 shape, no data leaked back")
        void honeypot_shouldLookIdentical() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(CourseEnquiryService.CourseEnquirySubmitResult.honeypot());

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().website("http://spam.example").build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("Whitespace in the mobile number is normalised before the service sees it")
        void mobileIsNormalised() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(CourseEnquiryService.CourseEnquirySubmitResult.success(response(3L)));

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobile("+91 98844 55667").build())))
                    .andExpect(status().isCreated());

            ArgumentCaptor<CourseEnquiryRequest> captor =
                    ArgumentCaptor.forClass(CourseEnquiryRequest.class);
            verify(service).create(captor.capture(), anyString());

            assertThat(captor.getValue().getMobile()).isEqualTo("+919884455667");
        }
    }

    @Nested
    @DisplayName("GET /api/course-enquiries (admin)")
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
            when(service.list(isNull(), isNull(), any(Pageable.class)))
                    .thenReturn(PageResponse.<CourseEnquiryResponse>builder()
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
            when(service.list(isNull(), isNull(), any(Pageable.class)))
                    .thenReturn(PageResponse.<CourseEnquiryResponse>builder()
                            .content(List.of())
                            .page(0).size(20).totalElements(0).totalPages(0)
                            .build());

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Paging, sorting and filters reach the service as given")
        @WithMockUser(roles = "ADMIN")
        void queryParamsArePassedThrough() throws Exception {
            when(service.list(eq(3L), eq("divya"), any(Pageable.class)))
                    .thenReturn(PageResponse.<CourseEnquiryResponse>builder()
                            .content(List.of(response(1L)))
                            .page(2).size(5).totalElements(11).totalPages(3)
                            .build());

            mockMvc.perform(get(BASE_URL)
                            .param("courseId", "3")
                            .param("search", "divya")
                            .param("page", "2")
                            .param("size", "5")
                            .param("sortBy", "createdAt")
                            .param("sortDir", "asc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.page").value(2));

            ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
            verify(service).list(eq(3L), eq("divya"), pageable.capture());

            assertThat(pageable.getValue().getPageNumber()).isEqualTo(2);
            assertThat(pageable.getValue().getPageSize()).isEqualTo(5);
            assertThat(pageable.getValue().getSort().getOrderFor("createdAt")).isNotNull();
            assertThat(pageable.getValue().getSort().getOrderFor("createdAt").isAscending()).isTrue();
        }
    }
}
