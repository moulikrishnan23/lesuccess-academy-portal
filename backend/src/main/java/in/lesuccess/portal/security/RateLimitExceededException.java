package in.lesuccess.portal.security;

/**
 * Thrown by RateLimitFilter when a client exceeds the allowed request rate.
 * Handled by GlobalExceptionHandler to return 429.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException() {
        super("Too many requests. Please try again later.");
    }

    public RateLimitExceededException(String message) {
        super(message);
    }
}
