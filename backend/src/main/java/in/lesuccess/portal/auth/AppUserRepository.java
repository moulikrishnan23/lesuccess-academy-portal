package in.lesuccess.portal.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    default Optional<AppUser> findByEmailOrUsername(String identifier) {
        if (identifier == null) return Optional.empty();
        String clean = identifier.trim();
        Optional<AppUser> byEmail = findByEmailIgnoreCase(clean);
        if (byEmail.isPresent()) return byEmail;
        return findByUsernameIgnoreCase(clean);
    }
}
