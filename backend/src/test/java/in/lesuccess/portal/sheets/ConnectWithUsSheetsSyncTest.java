package in.lesuccess.portal.sheets;

import in.lesuccess.portal.connectwithus.ConnectWithUs;
import in.lesuccess.portal.connectwithus.ConnectWithUsCreatedEvent;
import in.lesuccess.portal.connectwithus.ConnectWithUsRepository;
import in.lesuccess.portal.connectwithus.ConnectWithUsSheetRowSource;
import in.lesuccess.portal.connectwithus.ConnectWithUsSheetsSyncListener;
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
 * Proves a committed "Connect with Us" submission reaches Google Sheets on the
 * right tab with the right cells.
 *
 * <p><strong>No live Sheets call anywhere here.</strong> The seam under test is
 * {@link SheetsSyncDispatcher}, which is the single point where a module hands a
 * write to the background executor — everything past it (retry, failure
 * recording, the Google client itself) is shared infrastructure already covered
 * by its own tests. Mocking the dispatcher rather than the Google {@code Sheets}
 * client also means this test does not depend on the service-account
 * credentials.</p>
 */
@ExtendWith(MockitoExtension.class)
class ConnectWithUsSheetsSyncTest {

    @Mock
    private ConnectWithUsRepository repository;

    @Mock
    private SheetsSyncDispatcher dispatcher;

    private ConnectWithUs submission() {
        return ConnectWithUs.builder()
                .id(42L)
                .createdAt(LocalDateTime.of(2026, 9, 16, 10, 30, 0))
                .name("Divya Ramesh")
                .mobile("9884455667")
                .email("divya.ramesh@gmail.com")
                .build();
    }

    private SheetRow queuedRowFor(ConnectWithUs entity) {
        new ConnectWithUsSheetsSyncListener(dispatcher)
                .handleCreated(new ConnectWithUsCreatedEvent(this, entity));

        ArgumentCaptor<SheetRow> captor = ArgumentCaptor.forClass(SheetRow.class);
        verify(dispatcher).submitAppend(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("a created submission is queued as an append to the \"Connect With Us\" tab")
    void createdSubmission_isQueuedForTheConnectWithUsTab() {
        SheetRow row = queuedRowFor(submission());

        assertThat(row.spec().tabName())
                .as("the tab is named literally \"Connect With Us\"")
                .isEqualTo("Connect With Us");
        assertThat(row.entityType()).isEqualTo(SyncEntityType.CONNECT_WITH_US);
        assertThat(row.entityId()).isEqualTo(42L);
    }

    @Test
    @DisplayName("the queued row carries the specified four values, in header order")
    void queuedRowCarriesTheRightValues() {
        assertThat(queuedRowFor(submission()).values()).containsExactly(
                "Divya Ramesh",
                "9884455667",
                "divya.ramesh@gmail.com",
                "2026-09-16 10:30:00");
    }

    /**
     * Email is nullable on {@code connect_with_us}. A raw null would be dropped
     * during serialisation and shift "Submitted At" one column left, so it must
     * arrive as an empty cell.
     */
    @Test
    @DisplayName("a submission with no email leaves the Email cell blank, not null")
    void missingEmail_leavesTheCellBlank() {
        ConnectWithUs withoutEmail = submission();
        withoutEmail.setEmail(null);

        assertThat(queuedRowFor(withoutEmail).values()).containsExactly(
                "Divya Ramesh",
                "9884455667",
                "",
                "2026-09-16 10:30:00");
    }

    /**
     * The retry path rebuilds a row from the id alone. It has to produce the same
     * four cells as the original append, or a replayed failure lands on the sheet
     * misaligned against the header.
     */
    @Test
    @DisplayName("a row rebuilt for retry matches the row that was originally queued")
    void rebuiltRowMatchesTheOriginal() {
        when(repository.findById(42L)).thenReturn(Optional.of(submission()));

        Optional<SheetRow> rebuilt = new ConnectWithUsSheetRowSource(repository).buildRow(42L);

        assertThat(rebuilt).isPresent();
        assertThat(rebuilt.get().values())
                .isEqualTo(ConnectWithUsSheetRowSource.toRow(submission()).values());
    }

    @Test
    @DisplayName("a submission deleted before its retry rebuilds no row")
    void deletedSubmission_rebuildsNothing() {
        when(repository.findById(404L)).thenReturn(Optional.empty());

        assertThat(new ConnectWithUsSheetRowSource(repository).buildRow(404L)).isEmpty();
    }
}
