package in.lesuccess.portal.sheets;

import in.lesuccess.portal.contact.ContactMessage;
import in.lesuccess.portal.contact.ContactMessageSheetRowSource;
import in.lesuccess.portal.contact.ContactMessageStatus;
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

        assertThat(SheetSpec.columnIndex(spec.statusColumn()))
                .as("status column %s must be the last column of %s", spec.statusColumn(), spec.tabName())
                .isEqualTo(spec.headers().size() - 1);

        assertThat(spec.headers().get(SheetSpec.columnIndex(spec.statusColumn())))
                .as("the column declared as statusColumn must actually be the Status header")
                .isEqualTo("Status");

        assertThat(spec.headers().get(SheetSpec.columnIndex(spec.idColumn())))
                .as("the column declared as idColumn must actually be the ID header")
                .isEqualTo("ID");

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
         * since V18, and email, course id and looking-for have always been nullable.
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
                    .as("Mobile is optional since V18").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Email")))
                    .as("Email is nullable on lead_capture").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Course ID")))
                    .as("Course ID is nullable on lead_capture").isEqualTo("");
            assertThat(values.get(spec.headers().indexOf("Looking For")))
                    .as("Looking For is nullable on lead_capture").isEqualTo("");
        }

        @Test
        @DisplayName("hidden Mobile column is written, only collapsed from view")
        void hiddenColumnStillCarriesItsValue() {
            SheetSpec spec = LeadSheetRowSource.SPEC;

            assertThat(spec.hiddenColumns()).containsExactly("D");
            assertThat(spec.headers().get(SheetSpec.columnIndex("D"))).isEqualTo("Mobile");
            assertThat(LeadSheetRowSource.toRow(populatedLead()).values().get(SheetSpec.columnIndex("D")))
                    .isEqualTo("9791234567");
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
                .containsExactlyInAnyOrder(SyncEntityType.CONTACT_MESSAGE, SyncEntityType.LEAD);
    }
}
