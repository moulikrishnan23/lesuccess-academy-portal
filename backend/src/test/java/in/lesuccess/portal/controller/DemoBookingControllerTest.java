package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.demobooking.DemoBookingController;
import in.lesuccess.portal.demobooking.DemoBookingRequest;
import in.lesuccess.portal.demobooking.DemoBookingResponse;
import in.lesuccess.portal.demobooking.DemoBookingService;
import in.lesuccess.portal.demobooking.DemoBookingStatus;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer contract for the demo-booking routes, including the create()
 * signature change: the service now returns a DemoBookingSubmitResult carrying
 * the honeypot flag, and the controller passes the caller IP down.
 */
@WebMvcTest(DemoBookingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class DemoBookingControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DemoBookingService service;

    private static final String PUBLIC_URL = "/api/demo-bookings";
    private static final String ADMIN_URL = "/api/admin/demo-bookings";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private static DemoBookingRequest.DemoBookingRequestBuilder validRequest() {
        return DemoBookingRequest.builder()
                .name("Student User")
                .email("student@example.com")
                .courseName("Data Analytics")
                .mobileNumber("9876543210")
                .website("");
    }

    private static DemoBookingResponse response() {
        return DemoBookingResponse.builder()
                .id(1L)
                .courseName("Data Analytics")
                .mobileNumber("9876543210")
                .status(DemoBookingStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 9, 15, 13, 16, 33))
                .build();
    }

    @Nested
    @DisplayName("POST /api/demo-bookings (public)")
    class CreateTests {

        @Test
        @DisplayName("Valid request -> 201, no auth needed")
        void valid_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(DemoBookingService.DemoBookingSubmitResult.success(response()));

            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest().build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1))
                    .andExpect(jsonPath("$.data.status").value("PENDING"));
        }

        @Test
        @DisplayName("Course name is optional — only the mobile is required")
        void withoutCourseName_shouldReturn201() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(DemoBookingService.DemoBookingSubmitResult.success(response()));

            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().courseName(null).build())))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Missing mobile -> 400")
        void missingMobile_shouldReturn400() throws Exception {
            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobileNumber(null).build())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("Malformed mobile -> 400")
        void malformedMobile_shouldReturn400() throws Exception {
            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().mobileNumber("12345").build())))
                    .andExpect(status().isBadRequest());
        }

        /**
         * The whole point of the trap: the trapped response must be byte-identical
         * in shape to a genuine one, so a bot cannot detect that it was caught.
         */
        @Test
        @DisplayName("Honeypot hit -> same 201 and success flag, with no data echoed back")
        void honeypot_shouldLookIdenticalToSuccess() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(DemoBookingService.DemoBookingSubmitResult.honeypot());

            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    validRequest().website("http://spam.example").build())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Demo booking submitted successfully"));
        }

        /** The website field must deserialize rather than be rejected as unknown. */
        @Test
        @DisplayName("The website honeypot field is accepted on the wire")
        void websiteField_isBound() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(DemoBookingService.DemoBookingSubmitResult.success(response()));

            mockMvc.perform(post(PUBLIC_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\":\"Student User\",\"email\":\"student@example.com\","
                                    + "\"mobileNumber\":\"9876543210\",\"courseName\":\"Data Analytics\","
                                    + "\"website\":\"http://spam.example\"}"))
                    .andExpect(status().isCreated());

            ArgumentCaptor<DemoBookingRequest> captor =
                    ArgumentCaptor.forClass(DemoBookingRequest.class);
            verify(service).create(captor.capture(), anyString());

            assertThat(captor.getValue().getWebsite()).isEqualTo("http://spam.example");
        }

        /** V23 restored ip_address so the honeypot and duplicate hits are attributable. */
        @Test
        @DisplayName("The caller IP is passed to the service")
        void callerIp_isPassedDown() throws Exception {
            when(service.create(any(), anyString()))
                    .thenReturn(DemoBookingService.DemoBookingSubmitResult.success(response()));

            mockMvc.perform(post(PUBLIC_URL)
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.42");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(validRequest().build())))
                    .andExpect(status().isCreated());

            verify(service).create(any(), org.mockito.ArgumentMatchers.eq("203.0.113.42"));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/demo-bookings (admin)")
    class ListTests {

        @Test
        @DisplayName("No authentication -> 401")
        void unauthenticated_shouldReturn401() throws Exception {
            mockMvc.perform(get(ADMIN_URL))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("ADMIN -> 200 with a paginated envelope")
        @WithMockUser(roles = "ADMIN")
        void admin_shouldReturnPagedResults() throws Exception {
            when(service.listAll(any(), any()))
                    .thenReturn(PageResponse.<DemoBookingResponse>builder()
                            .content(List.of(response()))
                            .page(0).size(20).totalElements(1).totalPages(1)
                            .build());

            mockMvc.perform(get(ADMIN_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.content[0].id").value(1))
                    .andExpect(jsonPath("$.data.totalElements").value(1));
        }
    }
}
