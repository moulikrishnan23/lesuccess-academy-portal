package in.lesuccess.portal.sheets;

import in.lesuccess.portal.course.Course;
import in.lesuccess.portal.course.CourseRepository;
import in.lesuccess.portal.courseenquiry.CourseEnquiry;
import in.lesuccess.portal.courseenquiry.CourseEnquiryCreatedEvent;
import in.lesuccess.portal.courseenquiry.CourseEnquiryRepository;
import in.lesuccess.portal.courseenquiry.CourseEnquirySheetRowSource;
import in.lesuccess.portal.courseenquiry.CourseEnquirySheetsSyncListener;
import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetsSyncDispatcher;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Proves a committed course enquiry reaches Google Sheets on the right tab with
 * the right cells.
 *
 * <p><strong>No live Sheets call anywhere here.</strong> The seam under test is
 * {@link SheetsSyncDispatcher}, which is the single point where a module hands a
 * write to the background executor — everything past it (retry, failure
 * recording, the Google client itself) is shared infrastructure already covered
 * by its own tests. Mocking the dispatcher rather than the Google
 * {@code Sheets} client also means this test does not depend on the
 * service-account credentials, which is deliberate: a unit test that needed them
 * would be a second reason for that key to be readable in a developer
 * environment.</p>
 */
@ExtendWith(MockitoExtension.class)
class CourseEnquirySheetsSyncTest {

    @Mock
    private CourseEnquiryRepository enquiryRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SheetsSyncDispatcher dispatcher;

    private CourseEnquiry enquiry() {
        return CourseEnquiry.builder()
                .id(88L)
                .createdAt(LocalDateTime.of(2026, 9, 12, 11, 4, 9))
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .location("Chennai")
                .courseId(3L)
                .currentStatus("Working Professional")
                .build();
    }

    private Course course() {
        return Course.builder().id(3L).name("Data Analytics").isActive(true).build();
    }

    private CourseEnquirySheetRowSource rowSource() {
        return new CourseEnquirySheetRowSource(enquiryRepository, courseRepository);
    }

    @Test
    @DisplayName("a created enquiry is queued as an append to the \"Course Enquiry\" tab")
    void createdEnquiry_isQueuedForTheCourseEnquiryTab() {
        when(courseRepository.findById(3L)).thenReturn(Optional.of(course()));

        CourseEnquirySheetsSyncListener listener =
                new CourseEnquirySheetsSyncListener(dispatcher, rowSource());

        listener.handleCreated(new CourseEnquiryCreatedEvent(this, enquiry()));

        ArgumentCaptor<SheetRow> captor = ArgumentCaptor.forClass(SheetRow.class);
        verify(dispatcher).submitAppend(captor.capture());

        SheetRow row = captor.getValue();

        assertThat(row.spec().tabName())
                .as("the tab is named literally \"Course Enquiry\"")
                .isEqualTo("Course Enquiry");
        assertThat(row.entityType()).isEqualTo(SyncEntityType.COURSE_ENQUIRY);
        assertThat(row.entityId()).isEqualTo(88L);
    }

    @Test
    @DisplayName("the queued row carries the specified seven values, in header order")
    void queuedRowCarriesTheRightValues() {
        when(courseRepository.findById(3L)).thenReturn(Optional.of(course()));

        CourseEnquirySheetsSyncListener listener =
                new CourseEnquirySheetsSyncListener(dispatcher, rowSource());

        listener.handleCreated(new CourseEnquiryCreatedEvent(this, enquiry()));

        ArgumentCaptor<SheetRow> captor = ArgumentCaptor.forClass(SheetRow.class);
        verify(dispatcher).submitAppend(captor.capture());

        assertThat(captor.getValue().values()).containsExactly(
                "Divya Ramesh",
                "9884455667",
                "divya.ramesh@gmail.com",
                "Chennai",
                "Data Analytics",
                "Working Professional",
                "2026-09-12 11:04:09");
    }

    /**
     * ON DELETE SET NULL means a retired course leaves the id null, but a course
     * deleted in the window between commit and sync can still be missing when the
     * name is looked up. The enquiry is worth syncing either way, so the cell goes
     * blank rather than the append failing.
     */
    @Test
    @DisplayName("a course that has since been deleted leaves the Course cell blank")
    void missingCourse_leavesTheCellBlank() {
        when(courseRepository.findById(3L)).thenReturn(Optional.empty());

        CourseEnquirySheetsSyncListener listener =
                new CourseEnquirySheetsSyncListener(dispatcher, rowSource());

        listener.handleCreated(new CourseEnquiryCreatedEvent(this, enquiry()));

        ArgumentCaptor<SheetRow> captor = ArgumentCaptor.forClass(SheetRow.class);
        verify(dispatcher).submitAppend(captor.capture());

        assertThat(captor.getValue().values().get(4)).isEqualTo("");
    }

    @Test
    @DisplayName("an enquiry with no course selected needs no course lookup at all")
    void noCourseSelected_skipsTheLookup() {
        CourseEnquiry withoutCourse = enquiry();
        withoutCourse.setCourseId(null);

        CourseEnquirySheetsSyncListener listener =
                new CourseEnquirySheetsSyncListener(dispatcher, rowSource());

        listener.handleCreated(new CourseEnquiryCreatedEvent(this, withoutCourse));

        ArgumentCaptor<SheetRow> captor = ArgumentCaptor.forClass(SheetRow.class);
        verify(dispatcher).submitAppend(captor.capture());

        assertThat(captor.getValue().values().get(4)).isEqualTo("");
    }

    /**
     * The retry path rebuilds a row from the id alone. It has to produce the same
     * seven cells as the original append, or a replayed failure lands on the sheet
     * misaligned against the header.
     */
    @Test
    @DisplayName("a row rebuilt for retry matches the row that was originally queued")
    void rebuiltRowMatchesTheOriginal() {
        when(enquiryRepository.findById(88L)).thenReturn(Optional.of(enquiry()));
        when(courseRepository.findById(3L)).thenReturn(Optional.of(course()));

        CourseEnquirySheetRowSource source = rowSource();

        Optional<SheetRow> rebuilt = source.buildRow(88L);

        assertThat(rebuilt).isPresent();
        assertThat(rebuilt.get().values())
                .isEqualTo(CourseEnquirySheetRowSource.toRow(enquiry(), "Data Analytics").values());
    }

    @Test
    @DisplayName("an enquiry deleted before its retry rebuilds no row")
    void deletedEnquiry_rebuildsNothing() {
        when(enquiryRepository.findById(404L)).thenReturn(Optional.empty());

        assertThat(rowSource().buildRow(404L)).isEmpty();
    }
}
