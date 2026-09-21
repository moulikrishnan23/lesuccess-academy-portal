package in.lesuccess.portal.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Collections;

/**
 * Configuration for Google Sheets API v4.
 * Only creates beans when lesuccess.sheets.enabled=true.
 * Credentials and spreadsheet ID come from config / env vars.
 * <p>
 * Two credential sources, in priority order:
 * <ol>
 *   <li>{@code lesuccess.sheets.credentials-base64} (env {@code LESUCCESS_SHEETS_CREDENTIALS_BASE64})
 *       — base64-encoded key JSON, decoded in memory. Production.</li>
 *   <li>{@code lesuccess.sheets.credentials-path} (env {@code SHEETS_CREDENTIALS_PATH})
 *       — key file on disk. Local dev convenience.</li>
 * </ol>
 * <p>
 * NEVER commit the service account JSON key to the repo.
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "lesuccess.sheets.enabled", havingValue = "true")
public class GoogleSheetsConfig {

    // Prefer base64-in-env over a key file: baking a credentials file into a Docker image layer
    // means anyone with image access can extract it, even if the image is never pushed publicly —
    // an in-memory env var at runtime leaves nothing on disk to extract.
    @Value("${lesuccess.sheets.credentials-base64:}")
    private String credentialsBase64;

    @Value("${lesuccess.sheets.credentials-path:}")
    private String credentialsPath;

    /**
     * Socket timeouts for every Sheets call, in milliseconds.
     *
     * <p>Explicit because the google-http-client default for both is 20000ms, and
     * nothing here was overriding it. That default is why an unreachable Sheets
     * endpoint cost 20-40s <em>per tab</em> on startup: SheetsHeaderInitialiser
     * walks one tab per registered SheetRowSource, and each call burned a full
     * connect timeout, then potentially a full read timeout, before the catch
     * block it already had could run. Four tabs made that minutes.</p>
     *
     * <p>Externalised rather than constants so a slow network can be accommodated
     * without a redeploy, matching how duplicate-window-minutes is handled.</p>
     */
    @Value("${lesuccess.sheets.connect-timeout-ms:5000}")
    private int connectTimeoutMs = 5000;

    @Value("${lesuccess.sheets.read-timeout-ms:10000}")
    private int readTimeoutMs = 10000;

    /**
     * Speak HTTP/2 to the Sheets API instead of {@code HttpURLConnection}'s
     * HTTP/1.1.
     *
     * <p>Default on. {@code GoogleNetHttpTransport} is built on
     * {@code HttpURLConnection}, which cannot do HTTP/2 at all. On networks where
     * HTTP/1.1 to {@code sheets.googleapis.com} stalls — request written, response
     * never returned, killed by the read timeout — every call fails while the same
     * JVM reaches the same host over HTTP/2 in ~300ms. Measured on the network that
     * prompted this: 0/8 over HTTP/1.1, 10/10 over HTTP/2.</p>
     *
     * <p>Safe to leave on: the client negotiates by ALPN and falls back to HTTP/1.1
     * for any server that does not offer HTTP/2. Set false to restore the previous
     * transport if the new one ever misbehaves.</p>
     */
    @Value("${lesuccess.sheets.use-http2:true}")
    private boolean useHttp2 = true;

    @Bean
    public Sheets sheetsService() throws GeneralSecurityException, IOException {
        GoogleCredentials credentials;
        try (InputStream credentialsStream = openCredentialsStream()) {
            credentials = GoogleCredentials
                    .fromStream(credentialsStream)
                    .createScoped(Collections.singletonList(SheetsScopes.SPREADSHEETS));
        }

        HttpTransport transport;
        if (useHttp2) {
            transport = new Http2SheetsTransport(connectTimeoutMs, readTimeoutMs);
            log.info("Google Sheets transport: HTTP/2 (java.net.http.HttpClient)");
        } else {
            transport = GoogleNetHttpTransport.newTrustedTransport();
            log.info("Google Sheets transport: HTTP/1.1 (HttpURLConnection)");
        }

        return new Sheets.Builder(
                transport,
                GsonFactory.getDefaultInstance(),
                withTimeouts(new HttpCredentialsAdapter(credentials), connectTimeoutMs, readTimeoutMs))
                .setApplicationName("LeSuccess Portal")
                .build();
    }

    /**
     * Wrap an initializer so every request it prepares also carries a bounded
     * connect and read timeout.
     *
     * <p>Applied at the initializer rather than at the call sites deliberately:
     * {@code Sheets.Builder} runs this for every request the client builds, so
     * appends, status updates and header checks are all covered without
     * GoogleSheetsService knowing timeouts exist. Setting them per-call would
     * have meant remembering to do it in five places and forgetting in the
     * sixth.</p>
     *
     * <p><strong>The delegate runs first.</strong> {@link HttpCredentialsAdapter}
     * sets its own handlers and may set its own timeouts; calling it first and
     * overriding after means the configured values win. Reversing these two lines
     * would silently restore the 20s default.</p>
     *
     * <p>Package-private and static so it can be tested without credentials or a
     * network — see GoogleSheetsConfigTest.</p>
     */
    static HttpRequestInitializer withTimeouts(HttpRequestInitializer delegate,
                                               int connectTimeoutMs,
                                               int readTimeoutMs) {
        return request -> {
            if (delegate != null) {
                delegate.initialize(request);
            }
            request.setConnectTimeout(connectTimeoutMs);
            request.setReadTimeout(readTimeoutMs);
        };
    }

    /**
     * Resolve the credentials source. Base64 wins when both are set.
     * <p>
     * The decoded bytes go straight into a ByteArrayInputStream — they are never written
     * to a temp file, so there is no window in which the key exists on disk.
     */
    private InputStream openCredentialsStream() throws IOException {
        if (StringUtils.hasText(credentialsBase64)) {
            log.info("Loading Google Sheets credentials from LESUCCESS_SHEETS_CREDENTIALS_BASE64 (in memory)");
            // Secret managers and CI systems routinely line-wrap long base64 values, and the
            // strict decoder rejects embedded whitespace — strip it rather than fail on a valid key.
            byte[] decoded;
            try {
                decoded = Base64.getDecoder().decode(credentialsBase64.replaceAll("\\s", ""));
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException(
                        "lesuccess.sheets.credentials-base64 (env LESUCCESS_SHEETS_CREDENTIALS_BASE64) "
                                + "is not valid base64. Expected the base64-encoded service account JSON key.", ex);
            }
            return new ByteArrayInputStream(decoded);
        }

        if (StringUtils.hasText(credentialsPath)) {
            log.info("Loading Google Sheets credentials from file: {}", credentialsPath);
            return new FileInputStream(credentialsPath);
        }

        // Fail fast and name the variables: silently disabling the sync would let a
        // misconfigured production deploy look healthy while dropping every submission.
        throw new IllegalStateException(
                "Google Sheets sync is enabled (lesuccess.sheets.enabled=true) but no credentials were supplied. "
                        + "Set LESUCCESS_SHEETS_CREDENTIALS_BASE64 (base64-encoded service account JSON — preferred "
                        + "for production), or SHEETS_CREDENTIALS_PATH (path to the key file — local dev). "
                        + "Alternatively set LESUCCESS_SHEETS_ENABLED=false to turn the sync off.");
    }
}
