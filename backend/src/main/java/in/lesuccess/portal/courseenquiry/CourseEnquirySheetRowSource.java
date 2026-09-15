package in.lesuccess.portal.courseenquiry;

import in.lesuccess.portal.course.CourseRepository;
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
 * Course enquiries' sheet layout, and how to rebuild a row for retry.
 *
 * <p>Two things differ from the Contact and Lead sources, both deliberately:</p>
 *
 * <ol>
 *   <li><strong>Append-only spec.</strong> No ID column and no Status column:
 *       course_enquiry has no workflow status, and the counsellors work this tab
 *       by reading contact details top to bottom. {@link SheetSpec#appendOnly}
 *       states that rather than pointing the status letter at an arbitrary
 *       column.</li>
 *   <li><strong>Course <em>name</em>, not course id.</strong> The Leads tab
 *       carries a raw "Course ID" because a lead may name a course that has since
 *       been deleted. Here the id is FK-constrained and validated against a
 *       published course on the way in, so the name can be resolved — and a
 *       counsellor reading "Data Analytics" does not have to go look up 3.</li>
 * </ol>
 *
 * <p>The name lookup is why {@code toRow} takes the resolved name as an argument
 * and the repository lookup lives in the instance method: the static form stays
 * pure and directly testable, exactly as the other two sources are.</p>
 */
@Component
@RequiredArgsConstructor
public class CourseEnquirySheetRowSource implements SheetRowSource {

    private final CourseEnquiryRepository repository;
    private final CourseRepository courseRepository;

    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Columns A-G. Append-only: this tab is never rewritten row-by-row. */
    public static final SheetSpec SPEC = SheetSpec.appendOnly(
            "Course Enquiry",
            List.of("Name", "Mobile", "Email", "Location", "Course",
                    "Currently You Are A", "Submitted At"));

    @Override
    public SyncEntityType entityType() {
        return SyncEntityType.COURSE_ENQUIRY;
    }

    @Override
    public SheetSpec spec() {
        return SPEC;
    }

    @Override
    public Optional<SheetRow> buildRow(Long entityId) {
        return repository.findById(entityId).map(this::rowFor);
    }

    /** Resolves the course name, then delegates to the pure {@link #toRow}. */
    public SheetRow rowFor(CourseEnquiry enquiry) {
        return toRow(enquiry, resolveCourseName(enquiry.getCourseId()));
    }

    /**
     * A course deleted between capture and sync leaves the cell blank rather than
     * failing the append: the enquiry itself is still worth having on the sheet,
     * and ON DELETE SET NULL means the id is already gone by then anyway.
     */
    private String resolveCourseName(Long courseId) {
        if (courseId == null) {
            return "";
        }
        return courseRepository.findById(courseId).map(course -> course.getName()).orElse("");
    }

    public static SheetRow toRow(CourseEnquiry enquiry, String courseName) {
        List<Object> values = Arrays.asList(
                enquiry.getName(),
                enquiry.getMobile(),
                // Every optional field is coerced rather than passed through: a raw
                // null is dropped during serialisation and shifts every later value
                // one column left, which corrupts the sheet silently.
                enquiry.getEmail() == null ? "" : enquiry.getEmail(),
                enquiry.getLocation() == null ? "" : enquiry.getLocation(),
                courseName == null ? "" : courseName,
                enquiry.getCurrentStatus() == null ? "" : enquiry.getCurrentStatus(),
                enquiry.getCreatedAt().format(DT_FORMAT)
        );

        return new SheetRow(SPEC, SyncEntityType.COURSE_ENQUIRY, enquiry.getId(), values);
    }
}
