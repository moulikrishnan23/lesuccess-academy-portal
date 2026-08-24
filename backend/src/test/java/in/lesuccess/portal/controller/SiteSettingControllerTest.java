package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.sitesetting.SiteSettingController;
import in.lesuccess.portal.sitesetting.SiteSettingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SiteSettingController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class SiteSettingControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private SiteSettingService service;

    private static final String BASE_URL = "/api/settings";

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Nested
    @DisplayName("GET /api/settings (public)")
    class GetTests {

        @Test
        @DisplayName("No auth -> 200 with a flat key/value map")
        void noAuth_shouldReturn200() throws Exception {
            when(service.getAll()).thenReturn(Map.of(
                    "email_primary", "hello@lesuccess.in",
                    "google_rating", "4.6"));

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.email_primary").value("hello@lesuccess.in"))
                    .andExpect(jsonPath("$.data.google_rating").value("4.6"));
        }

        @Test
        @DisplayName("Response is cacheable - this data changes rarely")
        void shouldSetCacheControlHeader() throws Exception {
            when(service.getAll()).thenReturn(Map.of());

            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "max-age=300, public"));
        }
    }

    @Nested
    @DisplayName("PUT /api/settings (admin)")
    class UpdateTests {

        @Test
        @DisplayName("No auth -> 401")
        void noAuth_shouldReturn401() throws Exception {
            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"phone_primary\":\"+919000000000\"}"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Wrong role -> 403")
        @WithMockUser(roles = "USER")
        void wrongRole_shouldReturn403() throws Exception {
            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"phone_primary\":\"+919000000000\"}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Partial map -> 200 with the full map back")
        @WithMockUser(roles = "ADMIN")
        void partialUpdate_shouldReturn200() throws Exception {
            when(service.updateAll(any())).thenReturn(Map.of(
                    "phone_primary", "+919000000000",
                    "email_primary", "hello@lesuccess.in"));

            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"phone_primary\":\"+919000000000\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.phone_primary").value("+919000000000"))
                    // Untouched keys still come back, so the caller can refresh its cache.
                    .andExpect(jsonPath("$.data.email_primary").value("hello@lesuccess.in"));
        }

        @Test
        @DisplayName("Unknown key -> 400 naming the offending key")
        @WithMockUser(roles = "ADMIN")
        void unknownKey_shouldReturn400() throws Exception {
            when(service.updateAll(any())).thenThrow(new InvalidRequestException(
                    "Validation failed",
                    List.of(InvalidRequestException.fieldError("emial_primary", "Unknown setting key"))));

            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"emial_primary\":\"typo@example.com\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errors[?(@.field == 'emial_primary')]").exists());
        }

        @Test
        @DisplayName("Empty body map -> 400")
        @WithMockUser(roles = "ADMIN")
        void emptyMap_shouldReturn400() throws Exception {
            when(service.updateAll(any()))
                    .thenThrow(new InvalidRequestException("At least one setting must be provided"));

            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("Malformed JSON -> 400, not 500")
        @WithMockUser(roles = "ADMIN")
        void malformedJson_shouldReturn400() throws Exception {
            mockMvc.perform(put(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{not json"))
                    .andExpect(status().isBadRequest());
        }
    }
}
