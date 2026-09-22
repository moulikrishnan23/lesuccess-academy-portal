package in.lesuccess.portal.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseModuleResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private String description;
    private java.util.List<String> topics;
    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final com.fasterxml.jackson.databind.ObjectMapper OBJECT_MAPPER = new com.fasterxml.jackson.databind.ObjectMapper();

    public static java.util.List<String> parseTopics(String content) {
        if (content == null || content.isBlank()) {
            return java.util.Collections.emptyList();
        }
        String trimmed = content.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                return OBJECT_MAPPER.readValue(trimmed, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
            } catch (Exception ignored) {
            }
        }
        return java.util.Arrays.stream(trimmed.split("[\r\n]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }

    public static CourseModuleResponse from(CourseModule entity) {
        String content = entity.getContent();
        return CourseModuleResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourse().getId())
                .title(entity.getTitle())
                .content(content)
                .description(content)
                .topics(parseTopics(content))
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
