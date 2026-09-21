package in.lesuccess.portal.shared.sheets;

import java.util.List;

/**
 * Where and how one entity type is written to Google Sheets.
 *
 * <p>Each module owns its own tab. Keeping the tab, header row and column
 * letters together in one value means {@link GoogleSheetsService} never needs to
 * know which entity it is writing — that knowledge lives with the module that
 * produced the row.</p>
 *
 * <p>A tab that is only ever appended to declares no id or status column — see
 * {@link #appendOnly(String, List)}. Those two letters exist solely to support
 * rewriting an existing row in place, which an append-only tab never does.</p>
 *
 * @param tabName        sheet tab, e.g. "Contact Messages" or "Leads"
 * @param headers        header row, in column order
 * @param idColumn       column letter holding the entity id, scanned to locate a row;
 *                       null on an append-only tab
 * @param statusColumn   column letter holding the status, rewritten on status change;
 *                       null on an append-only tab
 * @param hiddenColumns  column letters collapsed out of view in the sheet. The values
 *                       are still written — dropping a column from {@code headers}
 *                       instead would shift every column after it — they are simply
 *                       not shown to the people working the sheet.
 */
public record SheetSpec(String tabName, List<String> headers, String idColumn, String statusColumn,
                        List<String> hiddenColumns) {

    /** Layout with every column visible — the common case. */
    public SheetSpec(String tabName, List<String> headers, String idColumn, String statusColumn) {
        this(tabName, headers, idColumn, statusColumn, List.of());
    }

    /**
     * A tab that is only ever appended to, never rewritten row-by-row.
     *
     * <p>Course enquiries have no workflow status and no id column on the sheet:
     * the people working that tab read it top to bottom and act off the contact
     * details, so an ID column would be noise. Declaring null for both letters
     * says that outright. The alternative — pointing {@code statusColumn} at some
     * arbitrary column so the field is non-null — would leave
     * {@link GoogleSheetsService#updateStatus} able to silently overwrite real
     * data if anything ever called it for this tab.</p>
     *
     * <p>{@link #headerRange()} and {@link #appendRange()}, the only two ranges an
     * append needs, work the same as for any other spec.</p>
     */
    public static SheetSpec appendOnly(String tabName, List<String> headers) {
        return new SheetSpec(tabName, headers, null, null, List.of());
    }

    /** True when this tab supports rewriting a row's status in place. */
    public boolean supportsStatusUpdate() {
        return idColumn != null && statusColumn != null;
    }

    /** A1-style range covering the full width of the header row, e.g. "Leads!A1:H1". */
    public String headerRange() {
        return tabName + "!A1:" + lastColumn() + "1";
    }

    /** Append range covering the full width, e.g. "Leads!A:H". */
    public String appendRange() {
        return tabName + "!A:" + lastColumn();
    }

    /** Range covering the id column only, scanned to find an entity's row. */
    public String idColumnRange() {
        requireStatusUpdateSupport();
        return tabName + "!" + idColumn + ":" + idColumn;
    }

    /** Single status cell for a 1-based sheet row number. */
    public String statusCell(int rowNumber) {
        requireStatusUpdateSupport();
        return tabName + "!" + statusColumn + rowNumber;
    }

    /**
     * Fails loudly rather than building a range like "Course Enquiry!nullA2".
     * Sheets would accept that string and report a parse error from the far side
     * of the network, long after the useful context is gone.
     */
    private void requireStatusUpdateSupport() {
        if (!supportsStatusUpdate()) {
            throw new IllegalStateException(
                    "Sheet tab '" + tabName + "' is append-only: it declares no id/status column, "
                            + "so a row cannot be located or rewritten in place.");
        }
    }

    /** Zero-based index of a column letter, as the Sheets dimension API expects it. */
    public static int columnIndex(String columnLetter) {
        return columnLetter.charAt(0) - 'A';
    }

    private String lastColumn() {
        // Single letter is sufficient: no sheet here is wider than 26 columns.
        return String.valueOf((char) ('A' + headers.size() - 1));
    }
}
