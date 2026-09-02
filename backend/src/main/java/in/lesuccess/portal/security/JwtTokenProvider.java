package in.lesuccess.portal.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
// Imported explicitly: this type lives in io.jsonwebtoken.security, which the
// wildcard above does not cover. Without it, "catch (SecurityException)" binds
// to java.lang.SecurityException — which JJWT never throws — and a bad-signature
// token escapes validateToken as an unhandled exception, surfacing as a raw 500
// instead of the intended 401.
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TEMPORARY JWT utility — coordinate with Johnson before merging.
 * May need to be replaced by a shared auth module.
 *
 * <p>Handles JWT generation (for dev/test only) and validation/extraction
 * for incoming requests.</p>
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${lesuccess.jwt.secret}") String secret,
            @Value("${lesuccess.jwt.expiration-ms:86400000}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generate a JWT token. Used for dev/test — production token generation
     * should be handled by the shared auth module.
     */
    public String generateToken(String username, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extract username (subject) from a valid JWT.
     */
    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extract granted authorities from the "roles" claim.
     */
    public Collection<GrantedAuthority> getAuthorities(String token) {
        Claims claims = parseClaims(token);
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);
        if (roles == null) {
            return Collections.emptyList();
        }
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }

    /**
     * Validate the token — checks signature, expiration, and well-formedness.
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT expired: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty: {}", ex.getMessage());
        } catch (SignatureException ex) {
            log.warn("JWT signature validation failed: {}", ex.getMessage());
        } catch (JwtException ex) {
            // Catch-all for every other JJWT failure. This filter must never let
            // an exception escape: anything uncaught here bypasses the 401 path
            // and Spring renders a bare 500 for what is really a bad credential.
            log.warn("Invalid JWT: {}", ex.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
