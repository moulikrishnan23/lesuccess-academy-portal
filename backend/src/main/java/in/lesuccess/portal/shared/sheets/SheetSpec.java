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
 * @param tabName      sheet tab, e.g. "Contact Messages" or "Leads"
 * @param headers      header row, in column order
 * @param idColumn     column letter holding the entity id, scanned to locate a row
 * @param statusColumn column letter holding the status, rewritten on status change
 */
public record SheetSpec(String tabName, List<String> headers, String idColumn, String statusColumn) {

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
        return tabName + "!" + idColumn + ":" + idColumn;
    }

    /** Single status cell for a 1-based sheet row number. */
    public String statusCell(int rowNumber) {
        return tabName + "!" + statusColumn + rowNumber;
    }

    private String lastColumn() {
        // Single letter is sufficient: no sheet here is wider than 26 columns.
        return String.valueOf((char) ('A' + headers.size() - 1));
    }
}
