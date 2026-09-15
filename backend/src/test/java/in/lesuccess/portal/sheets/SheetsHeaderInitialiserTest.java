package in.lesuccess.portal.sheets;

import in.lesuccess.portal.shared.sheets.GoogleSheetsService;
import in.lesuccess.portal.shared.sheets.SheetRow;
import in.lesuccess.portal.shared.sheets.SheetRowSource;
import in.lesuccess.portal.shared.sheets.SheetSpec;
import in.lesuccess.portal.shared.sheets.SheetsHeaderInitialiser;
import in.lesuccess.portal.shared.sheets.SyncEntityType;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Covers the two properties this class is relied on for: it must not run its
 * network walk on the startup thread, and one unreachable tab must not stop the
 * others.
 *
 * <p>No Spring context and no network. The executor is a capturing stand-in, so
 * "was this deferred or run inline?" is directly observable rather than inferred
 * from timing.</p>
 */
class SheetsHeaderInitialiserTest {

    /** Captures submitted work without running it, so deferral is observable. */
    private static final class CapturingExecutor implements Executor {
        private final List<Runnable> submitted = new ArrayList<>();

        @Override
        public void execute(Runnable command) {
            submitted.add(command);
        }

        void runAll() {
            // Lambda rather than Runnable::run: an unbound method reference makes the
            // list element the receiver, and null analysis cannot prove a Consumer
            // parameter non-null, so the reference form warns on correct code.
            submitted.forEach(task -> task.run());
        }
    }

    private static SheetRowSource source(String tabName) {
        return new SheetRowSource() {
            @Override
            public SyncEntityType entityType() {
                return SyncEntityType.CONTACT_MESSAGE;
            }

            @Override
            public SheetSpec spec() {
                return SheetSpec.appendOnly(tabName, List.of("A", "B"));
            }

            @Override
            public Optional<SheetRow> buildRow(Long entityId) {
                return Optional.empty();
            }
        };
    }

    /**
     * ApplicationReadyEvent listeners run on the thread completing
     * SpringApplication.run(), so anything touched inline here is wall-clock time
     * added to every boot.
     */
    @Test
    @DisplayName("Startup only queues the work — no Sheets call on the startup thread")
    void onApplicationReady_defersInsteadOfBlocking() {
        GoogleSheetsService sheetsService = mock(GoogleSheetsService.class);
        CapturingExecutor executor = new CapturingExecutor();

        new SheetsHeaderInitialiser(sheetsService, List.of(source("Leads")), executor)
                .onApplicationReady();

        verifyNoInteractions(sheetsService);
        assertThat(executor.submitted).hasSize(1);
    }

    /**
     * One task for the whole walk, not one per tab: four startup tasks would eat
     * into the same bounded pool the actual row writes use.
     */
    @Test
    @DisplayName("All tabs are queued as a single task")
    void allTabsShareOneTask() {
        CapturingExecutor executor = new CapturingExecutor();

        new SheetsHeaderInitialiser(
                mock(GoogleSheetsService.class),
                List.of(source("Leads"), source("Contact Messages"),
                        source("Demo Bookings"), source("Course Enquiry")),
                executor)
                .onApplicationReady();

        assertThat(executor.submitted).hasSize(1);
    }

    @Test
    @DisplayName("Once run, every tab is prepared")
    void queuedTask_preparesEveryTab() throws IOException {
        GoogleSheetsService sheetsService = mock(GoogleSheetsService.class);
        CapturingExecutor executor = new CapturingExecutor();

        new SheetsHeaderInitialiser(
                sheetsService, List.of(source("Leads"), source("Course Enquiry")), executor)
                .onApplicationReady();
        executor.runAll();

        verify(sheetsService, org.mockito.Mockito.times(2)).ensureHeaderRow(any());
        verify(sheetsService, org.mockito.Mockito.times(2)).applyHiddenColumns(any());
    }

    /**
     * The log-and-continue behaviour predates this change and must survive it: a
     * tab that cannot be reached is logged and skipped, never rethrown. Rethrowing
     * would now surface on a pool thread, where nothing would catch it.
     */
    @Test
    @DisplayName("A failing tab does not stop the tabs after it")
    void failingTab_doesNotStopTheOthers() throws IOException {
        GoogleSheetsService sheetsService = mock(GoogleSheetsService.class);
        CapturingExecutor executor = new CapturingExecutor();

        doThrow(new IOException("connect timed out"))
                .when(sheetsService).ensureHeaderRow(
                        org.mockito.ArgumentMatchers.argThat(
                                spec -> spec != null && "Leads".equals(spec.tabName())));

        new SheetsHeaderInitialiser(
                sheetsService, List.of(source("Leads"), source("Course Enquiry")), executor)
                .onApplicationReady();

        // Must not propagate: on a pool thread there is no caller to handle it.
        executor.runAll();

        verify(sheetsService, org.mockito.Mockito.times(2)).ensureHeaderRow(any());
        // The failing tab never reaches applyHiddenColumns; the healthy one does.
        verify(sheetsService).applyHiddenColumns(
                org.mockito.ArgumentMatchers.argThat(
                        spec -> spec != null && "Course Enquiry".equals(spec.tabName())));
        verify(sheetsService, never()).applyHiddenColumns(
                org.mockito.ArgumentMatchers.argThat(
                        spec -> spec != null && "Leads".equals(spec.tabName())));
    }
}
