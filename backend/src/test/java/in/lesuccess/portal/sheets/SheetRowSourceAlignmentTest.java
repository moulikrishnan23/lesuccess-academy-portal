package in.lesuccess.portal.sheets;

import in.lesuccess.portal.contact.ContactMessage;
import in.lesuccess.portal.contact.ContactMessageSheetRowSource;
import in.lesuccess.portal.contact.ContactMessageStatus;
import in.lesuccess.portal.courseenquiry.CourseEnquiry;
import in.lesuccess.portal.courseenquiry.CourseEnquirySheetRowSource;
import in.lesuccess.portal.demobooking.DemoBooking;
import in.lesuccess.portal.demobooking.DemoBookingSheetRowSource;
import in.lesuccess.portal.demobooking.DemoBookingStatus;
import in.lesuccess.portal.lead.Lead;
import in.lesuccess.portal.lead.LeadSheetRowSource;
import in.lesuccess.portal.lead.LeadSource;
import in.lesuccess.portal.lead.LeadStatus;
import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;

/**
 * Guards the column layout every {@link in.lesuccess.portal.shared.sheets.SheetRowSource}
 * writes to Google Sheets.
 *
 * <p>A sheet row is a positional list: nothing at runtime ties a value to the header above
 * it. Adding a header without adding a value — or letting a null through — silently shifts
 * every later column, and the damage lands in a spreadsheet people work by hand rather than
 * in a stack trace. These tests fail at build time instead.</p>
 */
class SheetRowSourceAlignmentTest {

    /**
     * Every invariant that must hold for any source, present and future.
     *
     * @param spec the layout under test
     * @param row  a row built from a fully-populated entity
     */
    private static void assertLayoutHolds(SheetSpec spec, SheetRow row) {
        assertThat(row.values())
                .as("one value per header, or every column after the gap shifts")
                .hasSameSizeAs(spec.headers());

        // An append-only tab declares neither letter: it is never located or
        // rewritten row-by-row, so there is no id to scan for and no status cell
        // to overwrite. Every positional invariant below still applies to it.
        if (spec.supportsStatusUpdate()) {
            assertThat(SheetSpec.columnIndex(spec.statusColumn()))
                    .as("status column %s must be the last column of %s", spec.statusColumn(), spec.tabName())
                    .isEqualTo(spec.headers().size() - 1);

            assertThat(spec.headers().get(SheetSpec.columnIndex(spec.statusColumn())))
                    .as("the column declared as statusColumn must actually be the Status header")
                    .isEqualTo("Status");

            assertThat(spec.headers().get(SheetSpec.columnIndex(spec.idColumn())))
                    .as("the column declared as idColumn must actually be the ID header")
                    .isEqualTo("ID");
        } else {
            assertThat(spec.headers())
                    .as("an append-only tab must not carry a Status column it can never update")
                    .doesNotContain("Status");
        }

        assertThat(row.values())
                .as("a null is dropped during serialisation and shifts later values one column left")
                .doesNotContainNull();

        assertThat(spec.hiddenColumns())
                .as("a hidden column must exist within the header range")
                .allSatisfy(letter -> assertThat(SheetSpec.columnIndex(letter))
                        .isBetween(0, spec.headers().size() - 1));
    }

    @Nested
    @DisplayName("Contact Messages tab")
    class ContactMessages {

        /** Fully populated: every column on this tab is NOT NULL in the schema. */
        private ContactMessage message() {
            return ContactMessage.builder()
                    .id(4821L)
                    .createdAt(LocalDateTime.of(2026, 9, 5, 14, 32, 10))
                    .name("Priya Raghavan")
                    .email("priya.raghavan@gmail.com")
                    .phone("9876543210")
                    .whoYouAre("Parent")
                    .lookingFor("NEET Coaching")
                    .location("Coimbatore")
                    .message("Looking for weekend batches for my daughter, currently in class 11.")
                    .status(ContactMessageStatus.NEW)
                    .build();
        }

        @Test
        @DisplayName("row aligns with its spec")
        void rowAlignsWithSpec() {
            assertLayoutHolds(ContactMessageSheetRowSource.SPEC,
                    ContactMessageSheetRowSource.toRow(message()));
        }

        @Test
        @DisplayName("spans columns A-J and tags the row for replay")
        void spansExpectedRange() {
            SheetSpec spec = ContactMessageSheetRowSource.SPEC;
            SheetRow row = ContactMessageSheetRowSource.toRow(message());

            assertThat(spec.headers()).hasSize(10);
            assertThat(spec.appendRange()).isEqualTo("Contact Messages!A:J");
            assertThat(spec.headerRange()).isEqualTo("Contact Messages!A1:J1");
            assertThat(row.entityType()).isEqualTo(SyncEntityType.CONTACT_MESSAGE);
            assertThat(row.entityId()).isEqualTo(4821L);
        }

        @Test
        @DisplayName("values sit under the headers they belong to")
        void valuesMatchHeaderOrder() {
            SheetSpec spec = ContactMessageSheetRowSource.SPEC;
            List<Object> values = ContactMessageSheetRowSource.toRow(message()).values();

            assertThat(values.get(spec.headers().indexOf("ID"))).isEqualTo(4821L);
            assertThat(values.get(spec.headers().indexOf("Name"))).isEqualTo("Priya Raghavan");
            assertThat(values.get(spec.headers().indexOf("Email"))).isEqualTo("priya.raghavan@gmail.com");
            assertThat(values.get(spec.headers().indexOf("Phone"))).isEqualTo("9876543210");
            assertThat(values.get(spec.headers().indexOf("Who You Are"))).isEqualTo("Parent");
            assertThat(values.get(spec.headers().indexOf("Looking For"))).isEqualTo("NEET Coaching");
            assertThat(values.get(spec.headers().indexOf("Location"))).isEqualTo("Coimbatore");
            assertThat(values.get(spec.headers().indexOf("Status"))).isEqualTo("NEW");
        }
    }

    @Nested
    @DisplayName("Leads tab")
    class Leads {

        /** Every optional column filled, so column order can be checked by value. */
        private Lead populatedLead() {
            return Lead.builder()
                    .id(1307L)
                    .createdAt(LocalDateTime.of(2026, 9, 5, 9, 5, 44))
                    .name("Arun Kumar")
                    .mobile("9791234567")
                    .email("arun.kumar@outlook.com")
                    .courseId(12L)
                    .lookingFor("NEET Repeater Batch")
                    .source(LeadSource.SERVICE_CTA_FORM)
                    .status(LeadStatus.NEW)
                    .build();
        }

        /**
         * Only the two columns the schema actually requires. Mobile has been optional
         * since V20, and email, course id and looking-for have always been nullable.
         */
        private Lead minimalLead() {
            return Lead.builder()
                    .id(1308L)
                    .createdAt(LocalDateTime.of(2026, 9, 5, 9, 7, 2))
                    .name("Meera Sundaram")
                    .mobile(null)
                    .email(null)
                    .courseId(null)
                    .lookingFor(null)
                    .source(LeadSource.HOME_DEMO_FORM)
                    .status(LeadStatus.NEW)
                    .build();
        }

        @Test
        @DisplayName("row aligns with its spec")
        void rowAlignsWithSpec() {
            assertLayoutHolds(LeadSheetRowSource.SPEC,
                    LeadSheetRowSource.toRow(populatedLead()));
        }

        @Test
        @DisplayName("row still aligns when every optional field is null")
        void rowAlignsWithNullOptionalFields() {
            assertLayoutHolds(LeadSheetRowSource.SPEC,
                    LeadSheetRowSource.toRow(minimalLead()));
        }

        @Test
        @DisplayName("spans columns A-I and tags the row for replay")
        void spansExpectedRange() {
            SheetSpec spec = LeadSheetRowSource.SPEC;
            SheetRow row = LeadSheetRowSource.toRow(populatedLead());

            assertThat(spec.headers()).hasSize(9);
            assertThat(spec.appendRange()).isEqualTo("Leads!A:I");
            assertThat(spec.headerRange()).isEqualTo("Leads!A1:I1");
            assertThat(row.entityType()).isEqualTo(SyncEntityType.LEAD);
            assertThat(row.entityId()).isEqualTo(1307L);
        }

        @Test
        @DisplayName("values sit under the headers they belong to")
        void valuesMatchHeaderOrder() {
            SheetSpec spec = LeadSheetRowSource.SPEC;
            List<Object> values = LeadSheetRowSource.toRow(populatedLead()).values();

            assertThat(values.get(spec.headers().indexOf("ID"))).isEqualTo(1307L);
            assertThat(values.get(spec.headers().indexOf("Name"))).isEqualTo("Arun Kumar");
            assertThat(values.get(spec.headers().indexOf("Mobile"))).isEqualTo("9791234567");
            assertThat(values.get(spec.headers().indexOf("Email"))).isEqualTo("arun.kumar@outlook.com");
            assertThat(values.get(spec.headers().indexOf("Course ID"))).isEqualTo(12L);
            assertThat(values.get(spec.headers().indexOf("Looking For"))).isEqualTo("NEET Repeater Batch");
            assertThat(values.get(spec.headers().indexOf("Source"))).isEqualTo("SERVICE_CTA_FORM");
            assertThat(values.get(spec.headers().indexOf("Status"))).isEqualTo("NEW");
        }

        /**
         * Each nullable field is checked by name rather than only through the
         * no-nulls assertion, so a regression names the column that broke.
         */
        @Test
        @DisplayName("each nullable field becomes an empty cell, never null")
        void nullableFieldsCoerceToEmptyString() {
            SheetSpec spec = LeadSheetRowSource.SPEC;
            List<Object> values = LeadSheetRowSource.toRow(minimalLead()).values();

            assertThat(values.get(spec.headers().indexOf("Mobile")))
                    .as("Mobile is optional since V20").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Email")))
                    .as("Email is nullable on lead_capture").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Course ID")))
                    .as("Course ID is nullable on lead_capture").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Looking For")))
                    .as("Looking For is nullable on lead_capture").isEqualTo("");
        }

        @Test
        @DisplayName("Mobile is visible and still sits at column D")
        void mobileColumnIsVisibleAndCarriesItsValue() {
            SheetSpec spec = LeadSheetRowSource.SPEC;

            // Mobile was collapsed out of view on the grounds that it is optional
            // and mostly blank. It is shown now: a number left by a lead is the
            // only way to call them back, so the filled-in cases outweigh the
            // clutter of the empty ones. No tab hides a column any more.
            assertThat(spec.hiddenColumns()).isEmpty();

            // Position stays pinned regardless of visibility. Rows already in the
            // spreadsheet are laid out this way, so moving Mobile would misalign
            // every one of them against the header.
            assertThat(spec.headers().get(SheetSpec.columnIndex("D"))).isEqualTo("Mobile");
            assertThat(LeadSheetRowSource.toRow(populatedLead()).values().get(SheetSpec.columnIndex("D")))
                    .isEqualTo("9791234567");
        }
    }

    @Nested
    @DisplayName("Demo Bookings tab")
    class DemoBookings {

        /** Every optional column filled, so column order can be checked by value. */
        private DemoBooking populatedBooking() {
            return DemoBooking.builder()
                    .id(2044L)
                    .createdAt(LocalDateTime.of(2026, 9, 5, 18, 12, 30))
                    .courseName("Full Stack Development")
                    .mobileNumber("9840012345")
                    .status(DemoBookingStatus.PENDING)
                    .build();
        }

        /**
         * Course name is the only column demo_booking leaves nullable: V17 added it at
         * length 200 without NOT NULL so a booking survives its course being renamed or
         * deleted. Mobile, status and created-at are NOT NULL on the table, so nulling
         * them here would test a row the database cannot hold.
         */
        private DemoBooking bookingWithoutCourseName() {
            return DemoBooking.builder()
                    .id(2045L)
                    .createdAt(LocalDateTime.of(2026, 9, 5, 18, 20, 1))
                    .courseName(null)
                    .mobileNumber("9840067890")
                    .status(DemoBookingStatus.CONTACTED)
                    .build();
        }

        @Test
        @DisplayName("row aligns with its spec")
        void rowAlignsWithSpec() {
            assertLayoutHolds(DemoBookingSheetRowSource.SPEC,
                    DemoBookingSheetRowSource.toRow(populatedBooking()));
        }

        @Test
        @DisplayName("row still aligns when the optional course name is null")
        void rowAlignsWithNullCourseName() {
            assertLayoutHolds(DemoBookingSheetRowSource.SPEC,
                    DemoBookingSheetRowSource.toRow(bookingWithoutCourseName()));
        }

        @Test
        @DisplayName("spans columns A-E and tags the row for replay")
        void spansExpectedRange() {
            SheetSpec spec = DemoBookingSheetRowSource.SPEC;
            SheetRow row = DemoBookingSheetRowSource.toRow(populatedBooking());

            assertThat(spec.headers()).hasSize(5);
            assertThat(spec.appendRange()).isEqualTo("Demo Bookings!A:E");
            assertThat(spec.headerRange()).isEqualTo("Demo Bookings!A1:E1");
            assertThat(row.entityType()).isEqualTo(SyncEntityType.DEMO_BOOKING);
            assertThat(row.entityId()).isEqualTo(2044L);
        }

        @Test
        @DisplayName("values sit under the headers they belong to")
        void valuesMatchHeaderOrder() {
            SheetSpec spec = DemoBookingSheetRowSource.SPEC;
            List<Object> values = DemoBookingSheetRowSource.toRow(populatedBooking()).values();

            assertThat(values.get(spec.headers().indexOf("ID"))).isEqualTo(2044L);
            assertThat(values.get(spec.headers().indexOf("Created At"))).isEqualTo("2026-09-05 18:12:30");
            assertThat(values.get(spec.headers().indexOf("Course Name"))).isEqualTo("Full Stack Development");
            assertThat(values.get(spec.headers().indexOf("Mobile Number"))).isEqualTo("9840012345");
            assertThat(values.get(spec.headers().indexOf("Status"))).isEqualTo("PENDING");
        }

        /**
         * Checked by name rather than only through the no-nulls assertion, so a
         * regression names the column that broke.
         */
        @Test
        @DisplayName("a null course name becomes an empty cell, never null")
        void nullCourseNameCoercesToEmptyString() {
            SheetSpec spec = DemoBookingSheetRowSource.SPEC;
            List<Object> values = DemoBookingSheetRowSource.toRow(bookingWithoutCourseName()).values();

            assertThat(values.get(spec.headers().indexOf("Course Name")))
                    .as("Course Name is nullable on demo_booking").isEqualTo("");
        }

        @Test
        @DisplayName("every column is visible: this tab hides none")
        void hidesNoColumns() {
            assertThat(DemoBookingSheetRowSource.SPEC.hiddenColumns()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Course Enquiry tab")
    class CourseEnquiries {

        /** Every optional column filled, so column order can be checked by value. */
        private CourseEnquiry populatedEnquiry() {
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

        /**
         * Only the two columns course_enquiry requires. Email, location, course id
         * and current status are all nullable per V22 — the modal marks only Name
         * and Mobile Number as required.
         */
        private CourseEnquiry minimalEnquiry() {
            return CourseEnquiry.builder()
                    .id(89L)
                    .createdAt(LocalDateTime.of(2026, 9, 12, 11, 9, 41))
                    .name("Karthik S")
                    .mobile("9003344556")
                    .email(null)
                    .location(null)
                    .courseId(null)
                    .currentStatus(null)
                    .build();
        }

        @Test
        @DisplayName("row aligns with its spec")
        void rowAlignsWithSpec() {
            assertLayoutHolds(CourseEnquirySheetRowSource.SPEC,
                    CourseEnquirySheetRowSource.toRow(populatedEnquiry(), "Data Analytics"));
        }

        @Test
        @DisplayName("row still aligns when every optional field is null")
        void rowAlignsWithNullOptionalFields() {
            assertLayoutHolds(CourseEnquirySheetRowSource.SPEC,
                    CourseEnquirySheetRowSource.toRow(minimalEnquiry(), null));
        }

        @Test
        @DisplayName("writes to a tab named Course Enquiry, spanning columns A-G")
        void spansExpectedRange() {
            SheetSpec spec = CourseEnquirySheetRowSource.SPEC;
            SheetRow row = CourseEnquirySheetRowSource.toRow(populatedEnquiry(), "Data Analytics");

            assertThat(spec.tabName()).isEqualTo("Course Enquiry");
            assertThat(spec.headers()).hasSize(7);
            assertThat(spec.appendRange()).isEqualTo("Course Enquiry!A:G");
            assertThat(spec.headerRange()).isEqualTo("Course Enquiry!A1:G1");
            assertThat(row.entityType()).isEqualTo(SyncEntityType.COURSE_ENQUIRY);
            assertThat(row.entityId()).isEqualTo(88L);
        }

        @Test
        @DisplayName("header row is exactly the seven specified columns, in order")
        void headersAreExactlyAsSpecified() {
            assertThat(CourseEnquirySheetRowSource.SPEC.headers())
                    .containsExactly("Name", "Mobile", "Email", "Location", "Course",
                            "Currently You Are A", "Submitted At");
        }

        @Test
        @DisplayName("values sit under the headers they belong to")
        void valuesMatchHeaderOrder() {
            SheetSpec spec = CourseEnquirySheetRowSource.SPEC;
            List<Object> values =
                    CourseEnquirySheetRowSource.toRow(populatedEnquiry(), "Data Analytics").values();

            assertThat(values.get(spec.headers().indexOf("Name"))).isEqualTo("Divya Ramesh");
            assertThat(values.get(spec.headers().indexOf("Mobile"))).isEqualTo("9884455667");
            assertThat(values.get(spec.headers().indexOf("Email"))).isEqualTo("divya.ramesh@gmail.com");
            assertThat(values.get(spec.headers().indexOf("Location"))).isEqualTo("Chennai");
            assertThat(values.get(spec.headers().indexOf("Currently You Are A")))
                    .isEqualTo("Working Professional");
            assertThat(values.get(spec.headers().indexOf("Submitted At")))
                    .isEqualTo("2026-09-12 11:04:09");
        }

        /**
         * The Leads tab carries a raw "Course ID"; this one carries the name, so a
         * counsellor reading the sheet does not have to look up what 3 means.
         */
        @Test
        @DisplayName("the Course column holds the course name, not its id")
        void courseColumnHoldsName() {
            SheetSpec spec = CourseEnquirySheetRowSource.SPEC;
            List<Object> values =
                    CourseEnquirySheetRowSource.toRow(populatedEnquiry(), "Data Analytics").values();

            assertThat(values.get(spec.headers().indexOf("Course"))).isEqualTo("Data Analytics");
        }

        @Test
        @DisplayName("each nullable field becomes an empty cell, never null")
        void nullableFieldsCoerceToEmptyString() {
            SheetSpec spec = CourseEnquirySheetRowSource.SPEC;
            List<Object> values = CourseEnquirySheetRowSource.toRow(minimalEnquiry(), null).values();

            assertThat(values.get(spec.headers().indexOf("Email"))).isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Location"))).isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Course"))).isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Currently You Are A"))).isEqualTo("");
        }

        /**
         * The tab has no status to rewrite, and asking for a status cell must fail
         * here rather than send Sheets a range built from a null column letter.
         */
        @Test
        @DisplayName("append-only: locating or rewriting a row is refused outright")
        void statusUpdateIsRefused() {
            SheetSpec spec = CourseEnquirySheetRowSource.SPEC;

            assertThat(spec.supportsStatusUpdate()).isFalse();
            assertThatIllegalStateException().isThrownBy(() -> spec.statusCell(2))
                    .withMessageContaining("append-only");
            assertThatIllegalStateException().isThrownBy(spec::idColumnRange)
                    .withMessageContaining("append-only");
        }
    }

    /**
     * Fails when a new entity starts syncing to Sheets without gaining coverage here.
     * {@code SyncEntityType} has exactly one constant per source by contract, so its
     * size is the cheapest reliable signal that a source was added.
     */
    @Test
    @DisplayName("every sync entity type has an alignment test above")
    void everySourceIsCovered() {
        assertThat(SyncEntityType.values())
                .as("a new SheetRowSource was added — give it a @Nested block in this test")
                .containsExactlyInAnyOrder(SyncEntityType.CONTACT_MESSAGE, SyncEntityType.LEAD,
                        SyncEntityType.DEMO_BOOKING, SyncEntityType.COURSE_ENQUIRY);
    }
}
