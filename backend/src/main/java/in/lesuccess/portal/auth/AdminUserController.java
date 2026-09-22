package in.lesuccess.portal.auth;

import in.lesuccess.portal.shared.dto.ApiResponse;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .filter(user -> user.isActive())
                .map(UserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        String username = request.getUsername().trim().toLowerCase();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new InvalidRequestException("Username already exists: " + username);
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new InvalidRequestException("Email already exists: " + email);
        }

        AppUser newUser = AppUser.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(request.getRole().toUpperCase())
                .isActive(true)
                .build();

        AppUser saved = userRepository.save(newUser);
        log.info("Admin created new user: id={}, username={}, role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", UserResponse.from(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails currentUser) {

        AppUser target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        // Protect master admin and self-deletion
        if ("admin@lesuccess.in".equalsIgnoreCase(target.getEmail()) || "admin".equalsIgnoreCase(target.getUsername())) {
            throw new InvalidRequestException("Primary system administrator cannot be deleted");
        }
        if (currentUser != null && currentUser.getUsername().equalsIgnoreCase(target.getUsername())) {
            throw new InvalidRequestException("You cannot delete your own account");
        }

        target.setActive(false);
        userRepository.save(target);
        log.info("Admin deactivated user: id={}, username={}", id, target.getUsername());
        return ResponseEntity.noContent().build();
    }
}
