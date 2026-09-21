package in.lesuccess.portal.shared.sheets;

import java.util.List;

/**
 * One entity rendered as a sheet row, tagged with enough identity for the
 * failure queue to replay it later.
 *
 * @param spec       target tab and column layout
 * @param entityType which table {@code entityId} refers to
 * @param entityId   primary key of the source row
 * @param values     cell values, in the column order of {@link SheetSpec#headers()}
 */
public record SheetRow(SheetSpec spec, SyncEntityType entityType, Long entityId, List<Object> values) {
}
