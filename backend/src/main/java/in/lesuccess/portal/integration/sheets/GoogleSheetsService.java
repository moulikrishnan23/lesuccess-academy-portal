package in.lesuccess.portal.integration.sheets;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import in.lesuccess.portal.contact.ContactMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Appends / updates rows in a Google Sheet.
 * Column layout: [id, createdAt, name, email, phone, whoYouAre, lookingFor, location, message, status]
 * Column A stores the DB id so status updates can look up the correct row.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class GoogleSheetsService {

    private final Sheets sheetsService;

    @Value("${lesuccess.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${lesuccess.sheets.sheet-name:Contact Messages}")
    private String sheetName;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Header labels for columns A–J, in the same order appendRow writes data. */
    private static final List<String> HEADERS = List.of(
            "ID", "Created At", "Name", "Email", "Phone",
            "Who You Are", "Looking For", "Location", "Message", "Status");

    /**
     * Ensure the sheet has exactly one header row, once, at startup.
     * <p>
     * Deliberately not fatal: a Sheets outage must not stop the application from
     * serving requests, and the next restart retries. Appends work with or without
     * the header, so degrading here costs only readability.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initialiseHeaderRow() {
        try {
            ensureHeaderRow();
        } catch (Exception ex) {
            log.error("Could not ensure header row on sheet '{}'. Appends are unaffected; "
                    + "will retry on next startup.", sheetName, ex);
        }
    }

    /**
     * Idempotent header installation.
     * <p>
     * Three cases: row 1 empty → write the header; row 1 already the header → do
     * nothing (this is what makes repeated restarts safe); row 1 holds real data →
     * insert a blank row above it first so nothing is overwritten, then write the
     * header. The existing data keeps all its values, just shifted down one row.
     */
    public void ensureHeaderRow() throws IOException {
        ValueRange firstRow = sheetsService.spreadsheets().values()
                .get(spreadsheetId, sheetName + "!A1:J1")
                .execute();

        List<List<Object>> values = firstRow.getValues();
        List<Object> rowOne = (values == null || values.isEmpty()) ? List.of() : values.get(0);

        if (!rowOne.isEmpty()) {
            String firstCell = String.valueOf(rowOne.get(0));
            if (HEADERS.get(0).equals(firstCell)) {
                log.debug("Header row already present on sheet '{}'; nothing to do", sheetName);
                return;
            }
            insertBlankRowAtTop();
            log.info("Row 1 of sheet '{}' held data; inserted a blank row above it "
                    + "(existing data shifted to row 2)", sheetName);
        }

        writeHeaderRow();
    }

    private void writeHeaderRow() throws IOException {
        ValueRange body = new ValueRange().setValues(List.of(new ArrayList<Object>(HEADERS)));
        sheetsService.spreadsheets().values()
                .update(spreadsheetId, sheetName + "!A1:J1", body)
                // RAW for consistency with appendRow — header labels are literal text.
                .setValueInputOption("RAW")
                .execute();
        log.info("Wrote header row to sheet '{}'", sheetName);
    }

    /** Shift every existing row down by one, leaving row 1 blank. */
    private void insertBlankRowAtTop() throws IOException {
        InsertDimensionRequest insert = new InsertDimensionRequest()
                .setRange(new DimensionRange()
                        .setSheetId(resolveSheetId())
                        .setDimension("ROWS")
                        .setStartIndex(0)
                        .setEndIndex(1))
                .setInheritFromBefore(false);

        sheetsService.spreadsheets()
                .batchUpdate(spreadsheetId, new BatchUpdateSpreadsheetRequest()
                        .setRequests(List.of(new Request().setInsertDimension(insert))))
                .execute();
    }

    /** Resolve the numeric gid for the configured tab — batchUpdate needs it, not the name. */
    private Integer resolveSheetId() throws IOException {
        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(spreadsheetId).execute();
        for (Sheet sheet : spreadsheet.getSheets()) {
            if (sheetName.equals(sheet.getProperties().getTitle())) {
                return sheet.getProperties().getSheetId();
            }
        }
        throw new IllegalStateException(
                "Tab '" + sheetName + "' not found in spreadsheet " + spreadsheetId);
    }

    /**
     * Append a new row for a contact message.
     */
    public void appendRow(ContactMessage message) throws IOException {
        List<Object> row = Arrays.asList(
                message.getId(),
                message.getCreatedAt().format(DT_FORMAT),
                message.getName(),
                message.getEmail(),
                message.getPhone(),
                message.getWhoYouAre(),
                message.getLookingFor(),
                message.getLocation(),
                message.getMessage(),
                message.getStatus().name()
        );

        ValueRange body = new ValueRange().setValues(List.of(row));

        sheetsService.spreadsheets().values()
                .append(spreadsheetId, sheetName + "!A:J", body)
                // RAW, not USER_ENTERED: USER_ENTERED parses each value as though a
                // human typed it, so "+919843217650" was read as a unary-plus numeric
                // expression and stored as 919843217650 (leading + silently lost), and
                // the formatted timestamp was converted to a date serial. RAW stores
                // exactly what we send.
                .setValueInputOption("RAW")
                .setInsertDataOption("INSERT_ROWS")
                .execute();

        log.info("Appended row to Google Sheet for contact message id={}", message.getId());
    }

    /**
     * Update the status cell (column J) for a contact message by looking up
     * its DB id in column A.
     */
    public void updateStatus(Long contactMessageId, String newStatus) throws IOException {
        // Read column A to find the row number
        String range = sheetName + "!A:A";
        ValueRange result = sheetsService.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();

        List<List<Object>> values = result.getValues();
        if (values == null) {
            log.warn("Sheet is empty, cannot update status for contact message id={}", contactMessageId);
            return;
        }

        int rowIndex = -1;
        for (int i = 0; i < values.size(); i++) {
            List<Object> row = values.get(i);
            if (!row.isEmpty() && String.valueOf(row.get(0)).equals(String.valueOf(contactMessageId))) {
                rowIndex = i + 1; // Sheets rows are 1-indexed
                break;
            }
        }

        if (rowIndex == -1) {
            log.warn("Contact message id={} not found in Sheet column A, cannot update status", contactMessageId);
            return;
        }

        // Update the status cell (column J)
        String statusCell = sheetName + "!J" + rowIndex;
        ValueRange body = new ValueRange().setValues(List.of(List.of(newStatus)));
        sheetsService.spreadsheets().values()
                .update(spreadsheetId, statusCell, body)
                .setValueInputOption("RAW")
                .execute();

        log.info("Updated status to '{}' in Sheet row {} for contact message id={}", newStatus, rowIndex, contactMessageId);
    }
}
