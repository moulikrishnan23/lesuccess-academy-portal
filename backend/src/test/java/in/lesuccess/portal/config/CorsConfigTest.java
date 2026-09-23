package in.lesuccess.portal.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    @Test
    @DisplayName("Should allow configured exact origins and wildcard Vercel preview domains")
    void shouldAllowConfiguredOriginsAndVercelPatterns() {
        CorsProperties properties = new CorsProperties();
        properties.setAllowedOrigins(List.of("https://lesuccess-academy-portal.vercel.app", "http://localhost:5173"));
        properties.setAllowedOriginPatterns(List.of("https://*.vercel.app", "https://*.lesuccess.in"));

        CorsConfig corsConfig = new CorsConfig(properties);
        CorsConfigurationSource source = corsConfig.corsConfigurationSource();

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/courses");
        CorsConfiguration config = source.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowCredentials()).isTrue();

        // Exact match
        assertThat(config.checkOrigin("https://lesuccess-academy-portal.vercel.app"))
                .isEqualTo("https://lesuccess-academy-portal.vercel.app");
        assertThat(config.checkOrigin("http://localhost:5173"))
                .isEqualTo("http://localhost:5173");

        // Wildcard preview deployments on Vercel
        assertThat(config.checkOrigin("https://lesuccess-academy-portal-dp0d24sps-mk-5f07.vercel.app"))
                .isEqualTo("https://lesuccess-academy-portal-dp0d24sps-mk-5f07.vercel.app");
        assertThat(config.checkOrigin("https://any-feature-branch.vercel.app"))
                .isEqualTo("https://any-feature-branch.vercel.app");

        // Subdomain of lesuccess.in
        assertThat(config.checkOrigin("https://portal.lesuccess.in"))
                .isEqualTo("https://portal.lesuccess.in");

        // Unauthorized external domain must be rejected (return null)
        assertThat(config.checkOrigin("https://malicious-website.com")).isNull();
        assertThat(config.checkOrigin("http://unknown-domain.org")).isNull();
    }
}