package in.lesuccess.portal.contact;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
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

    private static final List<String> HEADERS = List.of(
            "ID", "Created At", "Name", "Email", "Phone",
            "Who You Are", "Looking For", "Location", "Message", "Status");

    @EventListener(ApplicationReadyEvent.class)
    public void initialiseHeaderRow() {
        try {
            ensureHeaderRow();
        } catch (Exception ex) {
            log.error("Could not ensure header row on sheet '{}'. Appends are unaffected; "
                    + "will retry on next startup.", sheetName, ex);
        }
    }

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
                .setValueInputOption("RAW")
                .execute();
        log.info("Wrote header row to sheet '{}'", sheetName);
    }

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
                .setValueInputOption("RAW")
                .setInsertDataOption("INSERT_ROWS")
                .execute();

        log.info("Appended row to Google Sheet for contact message id={}", message.getId());
    }

    public void updateStatus(Long contactMessageId, String newStatus) throws IOException {
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
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex == -1) {
            log.warn("Contact message id={} not found in Sheet column A, cannot update status", contactMessageId);
            return;
        }

        String statusCell = sheetName + "!J" + rowIndex;
        ValueRange body = new ValueRange().setValues(List.of(List.of(newStatus)));
        sheetsService.spreadsheets().values()
                .update(spreadsheetId, statusCell, body)
                .setValueInputOption("RAW")
                .execute();

        log.info("Updated status to '{}' in Sheet row {} for contact message id={}", newStatus, rowIndex, contactMessageId);
    }
}
