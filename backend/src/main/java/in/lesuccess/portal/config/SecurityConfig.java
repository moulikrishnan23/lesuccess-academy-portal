package in.lesuccess.portal.config;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.security.JwtAuthenticationFilter;

import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * TEMPORARY Security configuration — coordinate with Johnson before merging.
 * May need to be replaced by a shared auth module.
 *
 * <p>Protects admin contact-message routes with JWT. Public POST is open.
 * CSRF disabled (stateless API), sessions are stateless.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                    // Swagger / OpenAPI
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Public: Auth & File uploads
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        // Public: form submissions
                        .requestMatchers(HttpMethod.POST, "/api/contact-messages").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/demo-bookings").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/upcoming-programs/*/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/leads").permitAll()
                        // Public: home page & site data reads
                        .requestMatchers(HttpMethod.GET, "/api/announcements/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/upcoming-programs", "/api/upcoming-programs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/gallery", "/api/gallery/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/team-members", "/api/team-members/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/companies", "/api/companies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/process-steps").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()
                        // Role-specific protected endpoints
                        .requestMatchers("/api/admin/gallery/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers("/api/admin/upcoming-programs/**").hasAnyRole("ADMIN", "MANAGER", "TRAINER")
                        // Admin: general admin and contact-message routes require auth
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/contact-messages/**").authenticated()
                        .requestMatchers("/api/services", "/api/services/**").authenticated()
                        .requestMatchers("/api/process-steps", "/api/process-steps/**").authenticated()
                        .requestMatchers("/api/settings", "/api/settings/**").authenticated()
                        .requestMatchers("/api/leads", "/api/leads/**").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()
                        // Everything else — permit for now; tighten as new modules are added
                        .anyRequest().permitAll()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            ApiResponse<Void> body = ApiResponse.error("Authentication required");
                            response.getWriter().write(objectMapper.writeValueAsString(body));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            ApiResponse<Void> body = ApiResponse.error("Access denied");
                            response.getWriter().write(objectMapper.writeValueAsString(body));
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
