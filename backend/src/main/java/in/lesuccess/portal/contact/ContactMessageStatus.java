package in.lesuccess.portal.contact;

/**
 * Status lifecycle for contact messages.
 * Validated in DTOs and service layer — stored as VARCHAR in DB
 * (not MySQL ENUM) to avoid migration pain when adding new statuses.
 */
public enum ContactMessageStatus {
    NEW,
    READ,
    REPLIED
}
