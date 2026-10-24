package in.lesuccess.portal.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lets browsers keep the public catalogue responses and revalidate them with an ETag,
 * instead of re-downloading the full body on every page load.
 *
 * <p>Spring Security's default {@code Cache-Control: no-store} forbids the browser
 * from storing the response at all, so an ETag alone would never be sent back. These
 * paths get {@code no-cache} instead: stored, but checked with the server on every
 * use. An unchanged response then comes back as an empty 304. Security's
 * CacheControlHeadersWriter leaves the header alone once it is already set, so this
 * needs no change to SecurityConfig.</p>
 *
 * <p>Deliberately not {@code max-age}: the admin dashboard reads these same public
 * endpoints right after saving, and a freshness window would show it stale data.</p>
 */
@Configuration
public class PublicApiCacheConfig {

    /**
     * Public read-only endpoints. An allow-list rather than "everything outside
     * /api/admin", because some admin-only lists (leads, contact messages) live
     * outside that prefix and must keep Security's no-store.
     */
    static final List<String> PUBLIC_GET_PREFIXES = List.of(
            "/api/courses",
            "/api/team-members",
            "/api/team-categories",
            "/api/testimonials",
            "/api/gallery",
            "/api/success-stories",
            "/api/upcoming-programs",
            "/api/settings",
            "/api/companies",
            "/api/services",
            "/api/process-steps",
            "/api/announcements"
    );

    @Bean
    public FilterRegistrationBean<PublicApiEtagFilter> publicApiEtagFilter() {
        FilterRegistrationBean<PublicApiEtagFilter> registration =
                new FilterRegistrationBean<>(new PublicApiEtagFilter());
        registration.addUrlPatterns("/api/*");
        registration.setName("publicApiEtagFilter");
        return registration;
    }

    static class PublicApiEtagFilter extends ShallowEtagHeaderFilter {

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            if (!"GET".equals(request.getMethod()) && !"HEAD".equals(request.getMethod())) {
                return true;
            }
            String path = request.getRequestURI().substring(request.getContextPath().length());
            return PUBLIC_GET_PREFIXES.stream()
                    .noneMatch(prefix -> path.equals(prefix) || path.startsWith(prefix + "/"));
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache");
            // Server-side time for the controller, so slow responses can be split
            // into network vs. server (visible in curl and the browser's Timing tab).
            // Set from inside the chain: the ETag wrapper is still holding the body,
            // so the response is not committed yet and the header can be added.
            long start = System.nanoTime();
            FilterChain timed = (req, res) -> {
                filterChain.doFilter(req, res);
                long ms = (System.nanoTime() - start) / 1_000_000;
                ((HttpServletResponse) res).setHeader("Server-Timing", "app;dur=" + ms);
            };
            super.doFilterInternal(request, response, timed);
        }
    }
}
