package in.lesuccess.portal.connectwithus;

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
 * The "Connect With Us" tab's layout, and how to rebuild a row for retry.
 *
 * <p><strong>Append-only</strong>, for the same reason as the Course Enquiry tab
 * and with a stronger claim to it: {@code connect_with_us} has no status column
 * at all, so there is nothing an in-place rewrite could ever update.
 * {@link SheetSpec#appendOnly} declares null for both the id and status column
 * letters, which makes {@code statusCell} and {@code idColumnRange} throw rather
 * than hand Sheets a range built from a null letter.</p>
 *
 * <p>No id column on the sheet either: the people working this tab read it top to
 * bottom and act off the contact details.</p>
 *
 * <p>Unlike {@code CourseEnquirySheetRowSource} there is no lookup of any kind
 * here — every cell comes off the entity — so {@code toRow} is static, takes the
 * entity alone, and {@link #buildRow} delegates straight to it. The tab name is
 * the form's own on-page heading, "Connect with Us", title-cased to match the
 * other tabs ("Contact Messages", "Demo Bookings", "Course Enquiry").</p>
 */
@Component
@RequiredArgsConstructor
public class ConnectWithUsSheetRowSource implements SheetRowSource {

    private final ConnectWithUsRepository repository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Columns A-E. Append-only: this tab is never rewritten row-by-row.
     *
     * <p>Message is last, after Submitted At, rather than beside the other fields
     * the visitor typed. It reads worse, and it is still correct: rows already in
     * the spreadsheet were written under the A-D layout, so inserting a column
     * mid-row would leave every historical submission's timestamp sitting under a
     * "Message" header. New columns go on the end for that reason alone.</p>
     */
    public static final SheetSpec SPEC = SheetSpec.appendOnly(
            "Connect With Us",
            List.of("Name", "Mobile", "Email", "Submitted At", "Message"));

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.CONNECT_WITH_US;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        return repository.findById(entityId).map(ConnectWithUsSheetRowSource::toRow);
    }

    public static SheetRow toRow(ConnectWithUs submission) {
        List<Object> values = Arrays.asList(
                submission.getName(),
                submission.getMobile(),
                // Coerced rather than passed through: a raw null is dropped during
                // serialisation and shifts every later value one column left, which
                // corrupts the sheet silently.
                submission.getEmail() == null ? "" : submission.getEmail(),
                submission.getCreatedAt().format(DT_FORMAT),
                // "How can we help you?" on the Home form. Persisted and shown in the
                // admin table since this table existed, but it never reached the sheet,
                // so whoever worked this tab could not see what was actually asked.
                submission.getMessage() == null ? "" : submission.getMessage()
        );

        return new SheetRow(SPEC, SyncEntityType.CONNECT_WITH_US, submission.getId(), values);
    }
}
