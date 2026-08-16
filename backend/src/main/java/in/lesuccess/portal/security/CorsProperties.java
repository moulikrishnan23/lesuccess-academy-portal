package in.lesuccess.portal.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Binds the {@code lesuccess.cors.*} block from application.yml.
 * <p>
 * Uses @ConfigurationProperties rather than @Value because the origins are
 * declared as a YAML sequence. Spring flattens sequences into indexed keys
 * ({@code allowed-origins[0]}, {@code [1]}, ...), so no scalar property named
 * {@code lesuccess.cors.allowed-origins} ever exists and a {@code ${...}}
 * placeholder against it cannot resolve. Relaxed binding handles sequences
 * natively.
 */
@ConfigurationProperties(prefix = "lesuccess.cors")
public class CorsProperties {

    /** Origins permitted to call the API. Never '*' — credentials are allowed. */
    private List<String> allowedOrigins = new ArrayList<>();

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }
}
