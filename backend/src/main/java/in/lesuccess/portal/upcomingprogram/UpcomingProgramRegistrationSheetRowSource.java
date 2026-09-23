package in.lesuccess.portal.upcomingprogram;

import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetRowSource;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Program registrations' sheet layout and how to rebuild a row for retry.
 *
 * <p>Webinar/workshop/internship sign-ups were the one public form whose data
 * never left the database: every other form — contact, leads, demo bookings,
 * course enquiries, connect-with-us — has had a row source since it was built,
 * but {@code UpcomingProgramService.register} saved and returned without
 * publishing anything, so the people working the spreadsheet had no view of who
 * had registered for an event.</p>
 */
@Component
@RequiredArgsConstructor
public class UpcomingProgramRegistrationSheetRowSource implements SheetRowSource {

    private final UpcomingProgramRegistrationRepository repository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Columns A-I. Append-only: a registration has no workflow status to rewrite,
     * so there is nothing for an id column to locate — the same call
     * {@code Course Enquiry} and {@code Connect With Us} make.
     *
     * <p>Mode and Venue come from the registration row, not from the program it
     * points at: the service snapshots both at sign-up time precisely so a program
     * later flipped from offline to online does not rewrite history for everyone
     * who already registered on the old terms.</p>
     */
    public static final SheetSpec SPEC = SheetSpec.appendOnly(
            "Program Registrations",
            List.of("Name", "Mobile Number", "Email", "Program", "Type",
                    "Event Date", "Mode", "Venue", "Submitted At"));

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.PROGRAM_REGISTRATION;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        // Fetch-joined: this runs on a Sheets retry thread with no open transaction,
        // where a lazy program proxy would throw instead of rendering a row.
        return repository.findByIdWithProgram(entityId)
                .map(UpcomingProgramRegistrationSheetRowSource::toRow);
    }

    public static SheetRow toRow(UpcomingProgramRegistration registration) {
        UpcomingProgram program = registration.getProgram();

        List<Object> values = Arrays.asList(
                registration.getName(),
                registration.getMobileNumber(),
                // Every optional value is coerced rather than passed through: a raw
                // null is dropped during serialisation and shifts every later value
                // one column left, which corrupts the sheet silently.
                blankIfNull(registration.getEmail()),
                program != null ? blankIfNull(program.getTitle()) : "",
                program != null && program.getType() != null ? program.getType().name() : "",
                program != null && program.getEventDate() != null
                        ? program.getEventDate().format(DATE_FORMAT) : "",
                blankIfNull(registration.getMode()),
                blankIfNull(registration.getVenueAddress()),
                registration.getCreatedAt() != null ? registration.getCreatedAt().format(DT_FORMAT) : ""
        );

        return new SheetRow(SPEC, SyncEntityType.PROGRAM_REGISTRATION, registration.getId(), values);
    }

    private static String blankIfNull(String value) {
        return value == null ? "" : value;
    }
}
