package in.lesuccess.portal.security;

import in.lesuccess.portal.auth.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component("primaryAdminSecurity")
@RequiredArgsConstructor
public class PrimaryAdminSecurity {

    private final AppUserRepository userRepository;

    /**
     * Determines whether the currently authenticated principal is the Primary Admin.
     * Evaluated in SpEL expressions: @PreAuthorize("@primaryAdminSecurity.isPrimaryAdmin()")
     */
    public boolean isPrimaryAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        String principalName = auth.getName();
        if (principalName == null || principalName.isBlank() || "anonymousUser".equalsIgnoreCase(principalName)) {
            return false;
        }

        // Standard Primary Admin: username 'admin' or email 'admin@lesuccess.in'
        if ("admin".equalsIgnoreCase(principalName) || "admin@lesuccess.in".equalsIgnoreCase(principalName)) {
            return true;
        }

        // Database-backed verification for primary/super admin credentials
        return userRepository.findByUsernameIgnoreCase(principalName)
                .map(user -> user.isActive() && (
                        "admin@lesuccess.in".equalsIgnoreCase(user.getEmail())
                        || "admin".equalsIgnoreCase(user.getUsername())
                        || "PRIMARY_ADMIN".equalsIgnoreCase(user.getRole())
                        || "SUPER_ADMIN".equalsIgnoreCase(user.getRole())
                ))
                .orElse(false);
    }

    /**
     * Programmatic assertion ensuring caller is Primary Admin, throwing AccessDeniedException if not.
     */
    public void checkPrimaryAdmin() {
        if (!isPrimaryAdmin()) {
            log.warn("Unauthorized attempt to perform Primary-Admin-only action");
            throw new AccessDeniedException("Access denied: Only the Primary Admin has permission to delete form submissions");
        }
    }
}
