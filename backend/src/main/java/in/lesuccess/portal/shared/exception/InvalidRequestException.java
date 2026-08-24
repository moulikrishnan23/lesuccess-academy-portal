package in.lesuccess.portal.shared.exception;

import in.lesuccess.portal.shared.dto.ApiResponse;

import java.util.List;

/**
 * A request that parsed and passed Bean Validation but is still invalid for a
 * reason only the service layer can see — an unknown settings key, a lead
 * source that is not currently accepted.
 *
 * <p>Maps to 400 with the same {@code errors[]} shape as a Bean Validation
 * failure, so a client parses one response format rather than two.</p>
 */
public class InvalidRequestException extends RuntimeException {

    private final transient List<ApiResponse.FieldError> fieldErrors;

    public InvalidRequestException(String message) {
        this(message, List.of());
    }

    public InvalidRequestException(String message, List<ApiResponse.FieldError> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors == null ? List.of() : fieldErrors;
    }

    public List<ApiResponse.FieldError> getFieldErrors() {
        return fieldErrors;
    }

    public static ApiResponse.FieldError fieldError(String field, String message) {
        return ApiResponse.FieldError.builder().field(field).message(message).build();
    }
}
