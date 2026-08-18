package in.lesuccess.portal.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
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

    @Bean
    public Sheets sheetsService() throws GeneralSecurityException, IOException {
        GoogleCredentials credentials;
        try (InputStream credentialsStream = openCredentialsStream()) {
            credentials = GoogleCredentials
                    .fromStream(credentialsStream)
                    .createScoped(Collections.singletonList(SheetsScopes.SPREADSHEETS));
        }

        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("LeSuccess Portal")
                .build();
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
