package in.lesuccess.portal.config;

import com.google.api.client.http.LowLevelHttpRequest;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Covers the HTTP/2 Sheets transport without opening a socket.
 *
 * <p>Same invariant as {@code GoogleSheetsConfigTest}: no test in this project
 * reaches the real Sheets API. What is checked here is the part that cannot be
 * caught by compiling — {@code java.net.http.HttpClient} throws
 * {@code IllegalArgumentException} for headers it reserves, and
 * {@code google-http-client} sets {@code Content-Length} on every request with a
 * body, so an unfiltered pass-through breaks every append while leaving reads
 * working. That asymmetry is exactly the kind of bug a happy-path smoke test
 * misses.</p>
 */
class Http2SheetsTransportTest {

    @Test
    @DisplayName("Headers HttpClient reserves are recognised, case-insensitively")
    void restrictedHeaders_areRecognised() {
        assertThat(Http2SheetsTransport.isRestrictedHeader("Content-Length")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("content-length")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("CONTENT-LENGTH")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Host")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Connection")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Expect")).isTrue();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Upgrade")).isTrue();
    }

    @Test
    @DisplayName("Headers the Sheets client depends on are not filtered out")
    void essentialHeaders_arePreserved() {
        // Authorization in particular: dropping it would turn every call into a
        // 401 that looks like a credentials problem rather than a transport bug.
        assertThat(Http2SheetsTransport.isRestrictedHeader("Authorization")).isFalse();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Content-Type")).isFalse();
        assertThat(Http2SheetsTransport.isRestrictedHeader("Accept-Encoding")).isFalse();
        assertThat(Http2SheetsTransport.isRestrictedHeader("User-Agent")).isFalse();
        assertThat(Http2SheetsTransport.isRestrictedHeader("X-Goog-Api-Client")).isFalse();
    }

    @Test
    @DisplayName("A restricted header can be offered without blowing up the request")
    void addingRestrictedHeader_isSilentlyDropped() throws IOException {
        Http2SheetsTransport transport = new Http2SheetsTransport(5000, 10000);
        LowLevelHttpRequest request =
                transport.buildRequest("POST", "https://sheets.googleapis.com/v4/spreadsheets/x");

        // google-http-client does exactly this on every request carrying a body.
        assertThatCode(() -> {
            request.addHeader("Content-Length", "123");
            request.addHeader("Host", "sheets.googleapis.com");
            request.addHeader("Authorization", "Bearer token");
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Every method the Sheets client uses is supported")
    void supportsTheMethodsSheetsUses() throws IOException {
        Http2SheetsTransport transport = new Http2SheetsTransport(5000, 10000);
        assertThat(transport.supportsMethod("GET")).isTrue();
        assertThat(transport.supportsMethod("POST")).isTrue();
        assertThat(transport.supportsMethod("PUT")).isTrue();
    }

    @Test
    @DisplayName("Per-request read timeout is accepted without disturbing the request")
    void setTimeout_isAccepted() throws IOException {
        Http2SheetsTransport transport = new Http2SheetsTransport(5000, 10000);
        LowLevelHttpRequest request =
                transport.buildRequest("GET", "https://sheets.googleapis.com/v4/spreadsheets/x");

        // GoogleSheetsConfig.withTimeouts calls this on every request; a zero or
        // negative value must not replace the configured default with an
        // instant-expiry timeout.
        assertThatCode(() -> {
            request.setTimeout(5000, 10000);
            request.setTimeout(0, 0);
        }).doesNotThrowAnyException();
    }
}
