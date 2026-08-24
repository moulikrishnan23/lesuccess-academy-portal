package in.lesuccess.portal.shared.sheets;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ensures every registered tab has its header row on startup.
 *
 * <p>Replaces the single hardcoded header bootstrap that used to live inside
 * GoogleSheetsService: each {@link SheetRowSource} now declares its own tab, so
 * a new module gets its header row for free.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class SheetsHeaderInitialiser {

    private final GoogleSheetsService sheetsService;
    private final List<SheetRowSource> rowSources;

    @EventListener(ApplicationReadyEvent.class)
    public void initialiseHeaderRows() {
        for (SheetRowSource source : rowSources) {
            SheetSpec spec = source.spec();
            try {
                sheetsService.ensureHeaderRow(spec);
            } catch (Exception ex) {
                // Appends are unaffected by a missing header, so a failure here must
                // not stop startup or the other tabs.
                log.error("Could not ensure header row on sheet '{}'. Appends are unaffected; "
                        + "will retry on next startup.", spec.tabName(), ex);
            }
        }
    }
}
