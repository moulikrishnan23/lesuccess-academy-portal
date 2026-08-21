package in.lesuccess.portal.security;

import in.lesuccess.portal.shared.dto.ApiResponse;

import tools.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Servlet filter that rate-limits POST requests to the configured public
 * form-submission endpoints.
 * <p>
 * The protected paths come from {@code lesuccess.rate-limit.protected-paths}
 * rather than a hardcoded constant, so adding a public form is a config change.
 * <p>
 * Keyed by client IP. Only applies to POST — admin GET/PUT/DELETE on the
 * same paths are not throttled.
 * <p>
 * X-Forwarded-For is only honored when trust-proxy is enabled and the
 * immediate client IP is in the trusted-proxies list (config-driven).
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter implements Filter {

    private final int requestsPerHour;
    private final boolean trustProxy;
    private final List<String> trustedProxies;
    private final Set<String> protectedPaths;
    private final ObjectMapper objectMapper;
    private final Cache<String, Bucket> bucketCache;

    public RateLimitFilter(
            @Value("${lesuccess.rate-limit.requests-per-hour:5}") int requestsPerHour,
            @Value("${lesuccess.rate-limit.trust-proxy:false}") boolean trustProxy,
            @Value("${lesuccess.rate-limit.trusted-proxies:}") List<String> trustedProxies,
            @Value("${lesuccess.rate-limit.protected-paths:/api/contact-messages}") List<String> protectedPaths,
            ObjectMapper objectMapper) {
        this.requestsPerHour = requestsPerHour;
        this.trustProxy = trustProxy;
        this.trustedProxies = trustedProxies;
        // Set for O(1) exact-match lookup on every request.
        this.protectedPaths = Set.copyOf(protectedPaths);
        this.objectMapper = objectMapper;
        this.bucketCache = Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterAccess(1, TimeUnit.HOURS)
                .build();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // Only rate-limit POST on the configured public form endpoints
        if (!isRateLimitedRequest(request)) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        Bucket bucket = bucketCache.get(clientIp, this::createBucket);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} on POST {}", clientIp, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiResponse<Void> errorResponse = ApiResponse.error("Too many requests. Please try again later.");
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }

    /**
     * Only apply rate limiting to POST on a configured protected path.
     * GET/PUT/DELETE on those same paths (admin routes) are not throttled.
     * <p>
     * Exact match rather than prefix match, deliberately: a prefix would also
     * catch admin sub-paths such as POST /api/leads/123/notes, throttling staff
     * at the public form's rate.
     */
    private boolean isRateLimitedRequest(HttpServletRequest request) {
        return "POST".equals(request.getMethod())
                && protectedPaths.contains(request.getRequestURI());
    }

    /**
     * Resolve client IP. Only honors X-Forwarded-For when:
     * 1. trust-proxy is enabled in config, AND
     * 2. the direct client IP (remoteAddr) is in the trusted-proxies list.
     * Otherwise falls back to request.getRemoteAddr().
     */
    private String resolveClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        if (trustProxy && trustedProxies.contains(remoteAddr)) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                // Take the first (leftmost) IP — the original client
                String clientIp = forwarded.split(",")[0].trim();
                if (!clientIp.isEmpty()) {
                    return clientIp;
                }
            }
        }

        return remoteAddr;
    }

    private Bucket createBucket(String key) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(requestsPerHour)
                .refillGreedy(requestsPerHour, Duration.ofHours(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
