package in.lesuccess.portal.exception;

/**
 * Thrown when a requested resource (by ID) is not found or has been soft-deleted.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " not found with id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
