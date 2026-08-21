package in.lesuccess.portal.shared.support;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

import java.time.LocalDateTime;

/**
 * The protections every public lead-capture form shares: honeypot detection,
 * free-text sanitisation, mobile-number normalisation, and the duplicate-window
 * boundary. Extracted from {@code ContactService} so {@code LeadService} applies
 * the same rules rather than a second, drifting copy of them.
 *
 * <p><strong>Deliberately a static utility, not a Spring bean.</strong> Every
 * method here is a pure function with no collaborators, so injection would buy
 * nothing — and it would cost something real: {@code ContactService} uses
 * Lombok's {@code @RequiredArgsConstructor}, and adding a fourth constructor
 * argument would make {@code ContactServiceTest}'s {@code @InjectMocks} pass
 * {@code null} for it, breaking the very tests that prove this extraction was
 * behaviour-preserving.</p>
 *
 * <p>Duplicate <em>detection</em> itself stays in each service: the query is
 * entity-specific (Contact matches on email+phone+message, Lead on mobile+source).
 * Only the shared notion of "how far back does recent mean" lives here.</p>
 */
@Slf4j
public final class LeadCaptureSupport {

    private LeadCaptureSupport() {
        // Utility class.
    }

    /**
     * True when the hidden honeypot field came back with content, which a human
     * using the form cannot do.
     *
     * <p>The caller's contract is silent success: return the same 201 a genuine
     * submission gets and skip the write. Anything that lets a bot distinguish
     * the two — a different status, a different response shape — turns the trap
     * into a probe.</p>
     *
     * @param honeypotValue the submitted value of the hidden field
     * @param ipAddress     caller IP, logged for pattern analysis only
     */
    public static boolean isHoneypotTriggered(String honeypotValue, String ipAddress) {
        if (honeypotValue != null && !honeypotValue.isBlank()) {
            log.warn("Honeypot triggered from IP: {}. Honeypot value: '{}'", ipAddress, honeypotValue);
            return true;
        }
        return false;
    }

    /**
     * Strip every tag from user-supplied free text. {@link Safelist#none()} keeps
     * text content and discards all markup, so stored values are inert wherever
     * they are later rendered.
     */
    public static String sanitizeText(String text) {
        return text == null ? null : Jsoup.clean(text, Safelist.none());
    }

    /**
     * Remove whitespace from a phone/mobile number so "+91 98765 43210" and
     * "+919876543210" compare equal for duplicate detection.
     */
    public static String normalizeMobile(String raw) {
        return raw == null ? null : raw.replaceAll("\\s+", "");
    }

    /**
     * The earliest creation time still counted as "recent" for duplicate
     * detection — a submission older than this is a new enquiry, not a
     * double-click.
     *
     * @param windowMinutes configured window; a non-positive value disables the
     *                      lookback by making the boundary "now"
     */
    public static LocalDateTime duplicateWindowStart(int windowMinutes) {
        return LocalDateTime.now().minusMinutes(Math.max(windowMinutes, 0));
    }
}
