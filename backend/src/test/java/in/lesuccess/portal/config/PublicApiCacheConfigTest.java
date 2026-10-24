package in.lesuccess.portal.config;

import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class PublicApiCacheConfigTest {

    private final PublicApiCacheConfig.PublicApiEtagFilter filter = new PublicApiCacheConfig.PublicApiEtagFilter();

    /** Stands in for the controller: writes a fixed JSON body. */
    private static final HttpServlet JSON_SERVLET = new HttpServlet() {
        @Override
        protected void service(HttpServletRequest req, HttpServletResponse res) throws IOException {
            res.setContentType("application/json");
            res.getWriter().write("{\"data\":[1,2,3]}");
        }
    };

    private MockHttpServletResponse get(String path, String ifNoneMatch) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        if (ifNoneMatch != null) {
            request.addHeader("If-None-Match", ifNoneMatch);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain(JSON_SERVLET));
        return response;
    }

    @Test
    @DisplayName("Public GET gets no-cache and an ETag")
    void publicGetIsRevalidatable() throws Exception {
        MockHttpServletResponse response = get("/api/courses", null);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getHeader("Cache-Control")).isEqualTo("no-cache");
        assertThat(response.getHeader("ETag")).isNotBlank();
        assertThat(response.getHeader("Server-Timing")).matches("app;dur=\\d+");
    }

    @Test
    @DisplayName("Unchanged public response revalidates as an empty 304")
    void matchingEtagReturns304() throws Exception {
        String etag = get("/api/courses/java-full-stack", null).getHeader("ETag");

        MockHttpServletResponse response = get("/api/courses/java-full-stack", etag);

        assertThat(response.getStatus()).isEqualTo(304);
        assertThat(response.getContentAsByteArray()).isEmpty();
    }

    @Test
    @DisplayName("Admin-only lists and look-alike paths are left to Security's no-store")
    void nonPublicPathsAreUntouched() throws Exception {
        for (String path : new String[] {"/api/leads", "/api/admin/courses", "/api/coursesX"}) {
            MockHttpServletResponse response = get(path, null);

            assertThat(response.getHeader("Cache-Control")).as(path).isNull();
            assertThat(response.getHeader("ETag")).as(path).isNull();
        }
    }

    @Test
    @DisplayName("Writes are never ETagged")
    void postIsUntouched() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/courses");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain(JSON_SERVLET));

        assertThat(response.getHeader("ETag")).isNull();
    }
}
