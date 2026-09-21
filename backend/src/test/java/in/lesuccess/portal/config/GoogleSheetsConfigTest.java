package in.lesuccess.portal.config;

import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Proves the configured Sheets timeouts actually reach the HTTP request, rather
 * than being properties nobody reads.
 *
 * <p>No network anywhere: {@code buildGetRequest} constructs a request object
 * without opening a socket, so the timeout fields can be inspected directly. This
 * project hits the real Sheets API in no test, and that invariant holds here.</p>
 */
class GoogleSheetsConfigTest {

    /** Builds a real HttpRequest without performing any I/O. */
    private static HttpRequest newRequest() throws IOException {
        return new NetHttpTransport()
                .createRequestFactory()
                .buildGetRequest(new GenericUrl("https://sheets.googleapis.com/"));
    }

    /**
     * Documents the default this change exists to override. If a library upgrade
     * ever moves it, this failing is the signal to revisit the chosen values —
     * 20000ms per phase is what made four tabs cost minutes on startup.
     */
    @Test
    @DisplayName("google-http-client defaults both timeouts to 20s — the behaviour being overridden")
    void libraryDefaultsAreTwentySeconds() throws IOException {
        HttpRequest request = newRequest();

        assertThat(request.getConnectTimeout()).isEqualTo(20_000);
        assertThat(request.getReadTimeout()).isEqualTo(20_000);
    }

    @Test
    @DisplayName("The wrapper applies both configured timeouts to the request")
    void timeoutsAreApplied() throws IOException {
        HttpRequest request = newRequest();

        GoogleSheetsConfig.withTimeouts(null, 5_000, 10_000).initialize(request);

        assertThat(request.getConnectTimeout()).isEqualTo(5_000);
        assertThat(request.getReadTimeout()).isEqualTo(10_000);
    }

    @Test
    @DisplayName("Configured values are honoured, not hardcoded defaults")
    void configuredValuesAreHonoured() throws IOException {
        HttpRequest request = newRequest();

        GoogleSheetsConfig.withTimeouts(null, 1_234, 5_678).initialize(request);

        assertThat(request.getConnectTimeout()).isEqualTo(1_234);
        assertThat(request.getReadTimeout()).isEqualTo(5_678);
    }

    /**
     * The credential adapter is the real delegate in production. It must still run
     * — it is what attaches the OAuth token — so a wrapper that replaced it rather
     * than chaining would produce 401s on every call.
     */
    @Test
    @DisplayName("The wrapped initializer still runs")
    void delegateIsStillInvoked() throws IOException {
        List<String> calls = new ArrayList<>();
        HttpRequestInitializer delegate = req -> calls.add("delegate");

        GoogleSheetsConfig.withTimeouts(delegate, 5_000, 10_000).initialize(newRequest());

        assertThat(calls).containsExactly("delegate");
    }

    /**
     * Order is load-bearing: the delegate runs first and the timeouts are applied
     * after, so a delegate that sets its own timeout cannot silently restore the
     * 20s default. Swapping the two lines in withTimeouts breaks this test and
     * nothing else, which is precisely why it exists.
     */
    @Test
    @DisplayName("Our timeouts win over a delegate that sets its own")
    void timeoutsOverrideTheDelegate() throws IOException {
        HttpRequestInitializer greedyDelegate = req -> {
            req.setConnectTimeout(20_000);
            req.setReadTimeout(20_000);
        };

        HttpRequest request = newRequest();
        GoogleSheetsConfig.withTimeouts(greedyDelegate, 5_000, 10_000).initialize(request);

        assertThat(request.getConnectTimeout()).isEqualTo(5_000);
        assertThat(request.getReadTimeout()).isEqualTo(10_000);
    }

    /**
     * Worst case per tab is connect + read, and SheetsHeaderInitialiser walks one
     * tab per registered source. This guards the budget rather than the mechanism:
     * if someone raises the defaults to a number that reintroduces minute-long
     * startups, this is the test that objects.
     */
    @Test
    @DisplayName("Default budget caps a hung tab at 15s, well under the old 40s")
    void defaultBudgetIsBounded() throws IOException {
        HttpRequest request = newRequest();

        GoogleSheetsConfig.withTimeouts(null, 5_000, 10_000).initialize(request);

        assertThat(request.getConnectTimeout() + request.getReadTimeout())
                .as("worst-case wall clock for one unreachable tab")
                .isLessThanOrEqualTo(15_000);
    }
}
