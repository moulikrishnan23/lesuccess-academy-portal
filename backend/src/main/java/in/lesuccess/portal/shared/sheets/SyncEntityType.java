package in.lesuccess.portal.shared.sheets;

/**
 * Which table a {@link SyncFailure} row refers to.
 *
 * <p>Replaces the old {@code contact_message_id} foreign key: the sync-failure
 * queue now serves more than one source table, and a single column cannot be
 * FK-constrained against two of them.</p>
 */
public enum SyncEntityType {
    CONTACT_MESSAGE,
    LEAD
}
