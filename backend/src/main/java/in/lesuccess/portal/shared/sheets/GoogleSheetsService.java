package in.lesuccess.portal.shared.sheets;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Writes rows to Google Sheets.
 *
 * <p>Entity-agnostic by design: every method takes a {@link SheetSpec} or a
 * {@link SheetRow} rather than a domain object, so Contact messages and Leads
 * land on their own tabs through one code path. Previously this class imported
 * {@code ContactMessage} directly and hardcoded its column layout, which is why
 * a second module could not have reused it without either mixing rows onto one
 * tab or forking the class.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class GoogleSheetsService {

    private final Sheets sheetsService;

    @Value("${lesuccess.sheets.spreadsheet-id}")
    private String spreadsheetId;

    /**
     * Ensure the tab's header row is present and correct.
     *
     * <p>If row 1 already holds data that is not the header, a blank row is
     * inserted above it so nothing is overwritten.</p>
     */
    public void ensureHeaderRow(SheetSpec spec) throws IOException {
        // A tab that does not exist yet is the normal state for a newly added
        // module. Without this, every read below fails with "Unable to parse
        // range" and the module's entire sync silently diverts into the failure
        // queue from its first write onward.
        if (findSheetId(spec.tabName()).isEmpty()) {
            createTab(spec.tabName());
            writeHeaderRow(spec);
            return;
        }

        ValueRange firstRow = sheetsService.spreadsheets().values()
                .get(spreadsheetId, spec.headerRange())
                .execute();

        List<List<Object>> values = firstRow.getValues();
        List<Object> rowOne = (values == null || values.isEmpty()) ? List.of() : values.get(0);

        if (!rowOne.isEmpty()) {
            String firstCell = String.valueOf(rowOne.get(0));
            if (spec.headers().get(0).equals(firstCell)) {
                log.debug("Header row already present on sheet '{}'; nothing to do", spec.tabName());
                return;
            }
            insertBlankRowAtTop(spec);
            log.info("Row 1 of sheet '{}' held data; inserted a blank row above it "
                    + "(existing data shifted to row 2)", spec.tabName());
        }

        writeHeaderRow(spec);
    }

    private void writeHeaderRow(SheetSpec spec) throws IOException {
        ValueRange body = new ValueRange().setValues(List.of(new ArrayList<Object>(spec.headers())));
        sheetsService.spreadsheets().values()
                .update(spreadsheetId, spec.headerRange(), body)
                .setValueInputOption("RAW")
                .execute();
        log.info("Wrote header row to sheet '{}'", spec.tabName());
    }

    private void insertBlankRowAtTop(SheetSpec spec) throws IOException {
        InsertDimensionRequest insert = new InsertDimensionRequest()
                .setRange(new DimensionRange()
                        .setSheetId(resolveSheetId(spec.tabName()))
                        .setDimension("ROWS")
                        .setStartIndex(0)
                        .setEndIndex(1))
                .setInheritFromBefore(false);

        sheetsService.spreadsheets()
                .batchUpdate(spreadsheetId, new BatchUpdateSpreadsheetRequest()
                        .setRequests(List.of(new Request().setInsertDimension(insert))))
                .execute();
    }

    private Integer resolveSheetId(String tabName) throws IOException {
        return findSheetId(tabName).orElseThrow(() -> new IllegalStateException(
                "Tab '" + tabName + "' not found in spreadsheet " + spreadsheetId));
    }

    private Optional<Integer> findSheetId(String tabName) throws IOException {
        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(spreadsheetId).execute();
        for (Sheet sheet : spreadsheet.getSheets()) {
            if (tabName.equals(sheet.getProperties().getTitle())) {
                return Optional.of(sheet.getProperties().getSheetId());
            }
        }
        return Optional.empty();
    }

    private void createTab(String tabName) throws IOException {
        AddSheetRequest addSheet = new AddSheetRequest()
                .setProperties(new SheetProperties().setTitle(tabName));

        sheetsService.spreadsheets()
                .batchUpdate(spreadsheetId, new BatchUpdateSpreadsheetRequest()
                        .setRequests(List.of(new Request().setAddSheet(addSheet))))
                .execute();

        log.info("Created missing tab '{}' in spreadsheet {}", tabName, spreadsheetId);
    }

    /** Append one entity as a new row on its own tab. */
    public void appendRow(SheetRow row) throws IOException {
        ValueRange body = new ValueRange().setValues(List.of(row.values()));

        sheetsService.spreadsheets().values()
                .append(spreadsheetId, row.spec().appendRange(), body)
                .setValueInputOption("RAW")
                .setInsertDataOption("INSERT_ROWS")
                .execute();

        log.info("Appended row to sheet '{}' for {} id={}",
                row.spec().tabName(), row.entityType(), row.entityId());
    }

    /** Rewrite the status cell of the row whose id column matches {@code entityId}. */
    public void updateStatus(SheetSpec spec, Long entityId, String newStatus) throws IOException {
        ValueRange result = sheetsService.spreadsheets().values()
                .get(spreadsheetId, spec.idColumnRange())
                .execute();

        List<List<Object>> values = result.getValues();
        if (values == null) {
            log.warn("Sheet '{}' is empty, cannot update status for id={}", spec.tabName(), entityId);
            return;
        }

        int rowNumber = -1;
        for (int i = 0; i < values.size(); i++) {
            List<Object> row = values.get(i);
            if (!row.isEmpty() && String.valueOf(row.get(0)).equals(String.valueOf(entityId))) {
                rowNumber = i + 1;
                break;
            }
        }

        if (rowNumber == -1) {
            log.warn("id={} not found in column {} of sheet '{}', cannot update status",
                    entityId, spec.idColumn(), spec.tabName());
            return;
        }

        ValueRange body = new ValueRange().setValues(List.of(List.of(newStatus)));
        sheetsService.spreadsheets().values()
                .update(spreadsheetId, spec.statusCell(rowNumber), body)
                .setValueInputOption("RAW")
                .execute();

        log.info("Updated status to '{}' in sheet '{}' row {} for id={}",
                newStatus, spec.tabName(), rowNumber, entityId);
    }
}
