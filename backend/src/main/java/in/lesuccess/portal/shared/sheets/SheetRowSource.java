package in.lesuccess.portal.shared.sheets;

import java.util.Optional;

/**
 * Describes one entity type's sheet layout and rebuilds its rows on demand.
 *
 * <p>One implementation per {@link SyncEntityType}, living in that entity's own
 * package. It lets shared infrastructure — the retry scheduler and the header-row
 * initialiser — work across every source table without importing any of them.
 * Adding a third source means adding an implementation; nothing in this package
 * changes.</p>
 */
public interface SheetRowSource {

    SyncEntityType entityType();

    /** Tab and column layout this entity writes to. */
    SheetSpec spec();

    /**
     * @return the row for this id, or empty when the entity no longer exists
     *         (deleted between the failed sync and the retry)
     */
    Optional<SheetRow> buildRow(Long entityId);
}
