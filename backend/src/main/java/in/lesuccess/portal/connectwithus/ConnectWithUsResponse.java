package in.lesuccess.portal.connectwithus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectWithUsResponse {

    private Long id;
    private String name;
    private String mobile;
    private String email;
    private String message;
    private LocalDateTime createdAt;

    public String getFullName() {
        return name;
    }

    public String getPhoneNumber() {
        return mobile;
    }

    public static ConnectWithUsResponse from(ConnectWithUs entity) {
        return ConnectWithUsResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
