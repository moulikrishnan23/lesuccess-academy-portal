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
    private LocalDateTime createdAt;

    public static ConnectWithUsResponse from(ConnectWithUs entity) {
        return ConnectWithUsResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .mobile(entity.getMobile())
                .email(entity.getEmail())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
