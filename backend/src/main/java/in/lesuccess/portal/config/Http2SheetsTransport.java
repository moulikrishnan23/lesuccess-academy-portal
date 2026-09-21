package in.lesuccess.portal.config;

import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.LowLevelHttpRequest;
import com.google.api.client.http.LowLevelHttpResponse;
import com.google.api.client.util.StreamingContent;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * A {@link HttpTransport} for the Google API client backed by
 * {@link java.net.http.HttpClient} over HTTP/2.
 *
 * <p><strong>Why this exists.</strong> {@code GoogleNetHttpTransport} is built on
 * {@code HttpURLConnection}, which predates HTTP/2 and speaks only HTTP/1.1.
 * On networks where HTTP/1.1 to {@code sheets.googleapis.com} stalls — the
 * request is written, the response never arrives, and the call dies on a read
 * timeout inside {@code parseHTTPHeader} — every Sheets call fails while the
 * same JVM reaches the same host over HTTP/2 in about 300ms. Measured on the
 * network that prompted this: 0/8 successful over HTTP/1.1, 10/10 over HTTP/2.</p>
 *
 * <p>This is a transport swap, not a retry or timeout change: no amount of
 * waiting helps a request that is never answered.</p>
 *
 * <p>The client negotiates via ALPN and falls back to HTTP/1.1 automatically
 * when a server does not offer HTTP/2, so this is safe on networks where the
 * original transport worked fine.</p>
 */
final class Http2SheetsTransport extends HttpTransport {

    /**
     * Headers {@link java.net.http.HttpClient} reserves and refuses to let a
     * caller set.
     *
     * <p>Not optional: {@code google-http-client} sets {@code Content-Length} on
     * every request carrying a body, and passing it through makes
     * {@code HttpRequest.Builder#header} throw {@code IllegalArgumentException} —
     * so every append would fail before leaving the JVM. The client computes all
     * of these itself from the body publisher and connection state.</p>
     */
    private static final Set<String> RESTRICTED_HEADERS =
            Set.of("connection", "content-length", "expect", "host", "upgrade");

    /**
     * Whether {@link java.net.http.HttpClient} would reject this header name.
     *
     * <p>Package-private and static so the filter can be tested without a socket —
     * getting it wrong fails every request carrying a body, and that is not a
     * failure the compiler or a happy-path test would catch.</p>
     */
    static boolean isRestrictedHeader(String name) {
        return RESTRICTED_HEADERS.contains(name.toLowerCase(Locale.ROOT));
    }

    private final HttpClient client;
    private final Duration readTimeout;

    Http2SheetsTransport(int connectTimeoutMs, int readTimeoutMs) {
        this.client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofMillis(connectTimeoutMs))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        this.readTimeout = Duration.ofMillis(readTimeoutMs);
    }

    @Override
    public boolean supportsMethod(String method) {
        // HttpClient accepts any token as a method name, and the Sheets calls in
        // use are GET, POST and PUT.
        return true;
    }

    @Override
    protected LowLevelHttpRequest buildRequest(String method, String url) {
        return new Request(method, url);
    }

    private final class Request extends LowLevelHttpRequest {

        private final String method;
        private final String url;
        private final List<String[]> headers = new ArrayList<>();
        private Duration perRequestTimeout = readTimeout;

        private Request(String method, String url) {
            this.method = method;
            this.url = url;
        }

        @Override
        public void addHeader(String name, String value) {
            if (!isRestrictedHeader(name)) {
                headers.add(new String[]{name, value});
            }
        }

        /**
         * {@inheritDoc}
         *
         * <p>Connect timeout is fixed on the shared client at construction, since
         * {@link HttpClient} is immutable; only the read timeout can vary per
         * request. In practice the Google client sets the same pair on every
         * request, so nothing is lost.</p>
         */
        @Override
        public void setTimeout(int connectTimeoutMs, int readTimeoutMs) {
            if (readTimeoutMs > 0) {
                this.perRequestTimeout = Duration.ofMillis(readTimeoutMs);
            }
        }

        @Override
        public LowLevelHttpResponse execute() throws IOException {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(perRequestTimeout);

            for (String[] header : headers) {
                builder.header(header[0], header[1]);
            }

            // Content type travels as a normal header here: google-http-client
            // keeps it in a typed field rather than in addHeader.
            if (getContentType() != null) {
                builder.header("Content-Type", getContentType());
            }
            if (getContentEncoding() != null) {
                builder.header("Content-Encoding", getContentEncoding());
            }

            builder.method(method, bodyPublisher());

            try {
                HttpResponse<InputStream> response =
                        client.send(builder.build(), HttpResponse.BodyHandlers.ofInputStream());
                return new Response(response);
            } catch (HttpTimeoutException ex) {
                // Translated so callers keep seeing the exception they already
                // handle; SheetSyncTask and the retry scheduler both treat a
                // SocketTimeoutException as retryable.
                throw new java.net.SocketTimeoutException("Read timed out: " + ex.getMessage());
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IOException("Interrupted while calling " + url, ex);
            }
        }

        /**
         * Buffers the request body in memory.
         *
         * <p>Acceptable because every payload here is a single spreadsheet row or
         * a small metadata batch. A streaming publisher would need a background
         * thread to pump {@link StreamingContent} into a pipe, which is not worth
         * it at these sizes.</p>
         */
        @SuppressWarnings("deprecation")
        private HttpRequest.BodyPublisher bodyPublisher() throws IOException {
            StreamingContent content = getStreamingContent();
            if (content == null) {
                return HttpRequest.BodyPublishers.noBody();
            }
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            content.writeTo(buffer);
            return HttpRequest.BodyPublishers.ofByteArray(buffer.toByteArray());
        }
    }

    private static final class Response extends LowLevelHttpResponse {

        private final HttpResponse<InputStream> response;
        /** Header pairs flattened, because the SPI addresses them by index. */
        private final List<String[]> headers = new ArrayList<>();

        private Response(HttpResponse<InputStream> response) {
            this.response = response;
            for (Map.Entry<String, List<String>> entry : response.headers().map().entrySet()) {
                for (String value : entry.getValue()) {
                    headers.add(new String[]{entry.getKey(), value});
                }
            }
        }

        @Override
        public InputStream getContent() {
            InputStream body = response.body();
            return body != null ? body : new ByteArrayInputStream(new byte[0]);
        }

        @Override
        public String getContentEncoding() {
            return response.headers().firstValue("content-encoding").orElse(null);
        }

        @Override
        public long getContentLength() {
            return response.headers().firstValueAsLong("content-length").orElse(-1L);
        }

        @Override
        public String getContentType() {
            return response.headers().firstValue("content-type").orElse(null);
        }

        /**
         * HTTP/2 carries no reason phrase, so the status line is synthesised.
         * {@code google-http-client} uses it only for logging and error messages.
         */
        @Override
        public String getStatusLine() {
            return response.version() + " " + response.statusCode();
        }

        @Override
        public int getStatusCode() {
            return response.statusCode();
        }

        @Override
        public String getReasonPhrase() {
            return null;
        }

        @Override
        public int getHeaderCount() {
            return headers.size();
        }

        @Override
        public String getHeaderName(int index) {
            return headers.get(index)[0];
        }

        @Override
        public String getHeaderValue(int index) {
            return headers.get(index)[1];
        }
    }
}
