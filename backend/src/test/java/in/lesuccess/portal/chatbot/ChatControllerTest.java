package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.course.CourseService;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.security.RateLimitFilter;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import in.lesuccess.portal.sitesetting.SiteSettingService;
import in.lesuccess.portal.upcomingprogram.UpcomingProgramService;

import com.github.benmanes.caffeine.cache.Ticker;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Scope;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * POST /api/chat through the real chatbot wiring: ChatbotConfig, ChatService,
 * ChatTools, the session store and the actual advisor chain. Only the edges are
 * mocked: the ChatModel and EmbeddingModel (no Gemini call is ever made), the
 * knowledge indexer's store, and the services under the tools.
 *
 * <p>Security is the real SecurityConfig, unchanged. These requests pass with no
 * authentication, which is the proof that /api/chat needs no SecurityConfig
 * entry.</p>
 */
@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        ChatbotConfig.class, ChatService.class, ChatTools.class, RateLimitFilter.class,
        ChatControllerTest.ModelConfig.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "chatbot.enabled=true",
        "spring.ai.google.genai.api-key=test-key-never-used",
        "lesuccess.rate-limit.requests-per-minute=3"
})
class ChatControllerTest {

    private static final String URL = "/api/chat";
    private static final String PROVIDER_SECRET = "AIzaSyFAKE-provider-key-in-error";
    private static final String UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

    @Autowired private WebApplicationContext webApplicationContext;
    @Autowired private ChatModel chatModel;
    @Autowired private RateLimitFilter rateLimitFilter;
    @Autowired private ExpiringChatMemoryRepository sessions;
    @Autowired private FakeTicker ticker;

    @MockitoBean private ChatKnowledgeIndexer indexer;
    @MockitoBean private CourseService courseService;
    @MockitoBean private UpcomingProgramService upcomingProgramService;
    @MockitoBean private SiteSettingService siteSettingService;

    private final VectorStore knowledge = mock(VectorStore.class);
    private MockMvc mockMvc;

    /** Caffeine time the test controls, so session expiry needs no waiting. */
    static class FakeTicker implements Ticker {
        private final AtomicLong nanos = new AtomicLong();

        @Override
        public long read() {
            return nanos.get();
        }

        void advance(Duration duration) {
            nanos.addAndGet(duration.toNanos());
        }
    }

    @TestConfiguration
    static class ModelConfig {

        /** A mocked ChatModel whose default methods stay real, so ChatClient can read its options. */
        @Bean
        ChatModel chatModel() {
            return mock(ChatModel.class, withSettings().defaultAnswer(CALLS_REAL_METHODS));
        }

        /** Exactly one, as ChatbotConfig requires. Never called: the indexer is mocked too. */
        @Bean
        EmbeddingModel embeddingModel() {
            return mock(EmbeddingModel.class);
        }

        @Bean
        FakeTicker ticker() {
            return new FakeTicker();
        }

        /** Stands in for Spring AI's ChatClientAutoConfiguration, which @WebMvcTest does not load. */
        @Bean
        @Scope("prototype")
        ChatClient.Builder chatClientBuilder(ChatModel chatModel) {
            return ChatClient.builder(chatModel);
        }
    }

    @BeforeEach
    void setUp() {
        reset(chatModel);
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        when(indexer.currentStore()).thenReturn(knowledge);
        when(knowledge.similaritySearch(any(SearchRequest.class))).thenReturn(List.of());
        when(chatModel.call(any(Prompt.class))).thenReturn(reply("Hello!"));
    }

    // ── Sessions ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("No sessionId → 200, and the response carries a new server-issued UUID")
    void noSessionId_issuesNewUuid() throws Exception {
        String sessionId = sessionIdOf(send(null, "Hi")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(matchesPattern(UUID_PATTERN)))
                .andExpect(jsonPath("$.reply").value("Hello!")));

        assertThat(sessions.isActiveSession(sessionId)).isTrue();
    }

    @Test
    @DisplayName("Each new conversation gets a different id")
    void eachNewConversation_getsItsOwnId() throws Exception {
        String first = sessionIdOf(send(null, "Hi").andExpect(status().isOk()));
        String second = sessionIdOf(send(null, "Hi").andExpect(status().isOk()));

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    @DisplayName("An issued id is reused across two calls, and the second call sees the first in memory")
    void issuedId_reusedAcrossCalls() throws Exception {
        when(chatModel.call(any(Prompt.class)))
                .thenReturn(reply("Nice to meet you, Priya."))
                .thenReturn(reply("You told me your name is Priya."));

        String sessionId = sessionIdOf(send(null, "My name is Priya").andExpect(status().isOk()));
        send(sessionId, "What is my name?")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionId))
                .andExpect(jsonPath("$.reply").value("You told me your name is Priya."));

        ArgumentCaptor<Prompt> prompts = ArgumentCaptor.forClass(Prompt.class);
        verify(chatModel, times(2)).call(prompts.capture());
        assertThat(prompts.getAllValues().get(1).getInstructions())
                .extracting(Message::getText)
                .anySatisfy(text -> assertThat(text).contains("My name is Priya"))
                .anySatisfy(text -> assertThat(text).contains("Nice to meet you, Priya."));
    }

    @Test
    @DisplayName("A sessionId the server never issued → 400 with a generic message, and no memory is created")
    void unissuedSessionId_returns400() throws Exception {
        String forged = UUID.randomUUID().toString();

        send(forged, "Hi")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(ChatService.INVALID_SESSION_MESSAGE));

        verify(chatModel, never()).call(any(Prompt.class));
        assertThat(sessions.findConversationIds()).doesNotContain(forged);
        assertThat(sessions.isActiveSession(forged)).isFalse();
    }

    @Test
    @DisplayName("An issued id past the idle timeout → 400, the same generic message")
    void expiredSessionId_returns400() throws Exception {
        String sessionId = sessionIdOf(send(null, "Hi").andExpect(status().isOk()));

        ticker.advance(Duration.ofMinutes(31)); // idle timeout is 30 minutes

        send(sessionId, "Still there?")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(ChatService.INVALID_SESSION_MESSAGE));
        verify(chatModel, times(1)).call(any(Prompt.class)); // only the first, pre-expiry call
        assertThat(sessions.findConversationIds()).doesNotContain(sessionId);
    }

    @Test
    @DisplayName("Activity keeps a session alive: the idle timeout restarts on every use")
    void activity_extendsSession() throws Exception {
        String sessionId = sessionIdOf(send(null, "Hi").andExpect(status().isOk()));

        ticker.advance(Duration.ofMinutes(20));
        send(sessionId, "Still here").andExpect(status().isOk());
        ticker.advance(Duration.ofMinutes(20)); // 40 min since issue, 20 since last use

        send(sessionId, "And again").andExpect(status().isOk());
    }

    // ── Replies, sources and prompt wiring ───────────────────────────────────

    @Test
    @DisplayName("Valid message, no auth → 200 with the reply and de-duplicated sources")
    void validMessage_returnsReplyAndSources() throws Exception {
        when(knowledge.similaritySearch(any(SearchRequest.class))).thenReturn(List.of(
                doc("course-1", "COURSE", "/courses/python"),
                doc("course-module-11", "COURSE_MODULE", "/courses/python"),
                doc("course-module-12", "COURSE_MODULE", "/courses/python"),
                doc("service-21", "SERVICE", "/services")));
        when(chatModel.call(any(Prompt.class))).thenReturn(reply("Our Python course covers Django."));

        send(null, "Tell me about Python")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Our Python course covers Django."))
                .andExpect(jsonPath("$.sources.length()").value(3))
                .andExpect(jsonPath("$.sources[0].type").value("COURSE"))
                .andExpect(jsonPath("$.sources[0].sourceUrl").value("/courses/python"))
                .andExpect(jsonPath("$.sources[1].type").value("COURSE_MODULE"))
                .andExpect(jsonPath("$.sources[2].sourceUrl").value("/services"));
    }

    @Test
    @DisplayName("The model receives the fixed system prompt and the configured retrieval settings")
    void promptWiring() throws Exception {
        send(null, "Hi").andExpect(status().isOk());

        ArgumentCaptor<Prompt> prompt = ArgumentCaptor.forClass(Prompt.class);
        verify(chatModel).call(prompt.capture());
        assertThat(prompt.getValue().getInstructions())
                .filteredOn(m -> m.getMessageType() == MessageType.SYSTEM)
                .extracting(Message::getText)
                .containsExactly(ChatbotPromptConfig.SYSTEM_PROMPT);
        assertThat(prompt.getValue().getUserMessage().getText()).contains("Hi", "Reference material");

        ArgumentCaptor<SearchRequest> search = ArgumentCaptor.forClass(SearchRequest.class);
        verify(knowledge).similaritySearch(search.capture());
        assertThat(search.getValue().getTopK()).isEqualTo(4);
        assertThat(search.getValue().getSimilarityThreshold()).isEqualTo(0.5);
    }

    // ── Validation and failures ──────────────────────────────────────────────

    @Test
    @DisplayName("Message over 500 characters → 400, model never called")
    void messageTooLong_returns400() throws Exception {
        send(null, "a".repeat(501))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("message"));

        verify(chatModel, never()).call(any(Prompt.class));
    }

    @Test
    @DisplayName("sessionId over 64 characters → 400")
    void sessionIdTooLong_returns400() throws Exception {
        send("s".repeat(65), "Hi")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("sessionId"));
    }

    @Test
    @ExtendWith(OutputCaptureExtension.class)
    @DisplayName("LLM exception → 503 with a generic message; provider details never leak, key masked in logs")
    void llmFailure_returns503Generic(CapturedOutput log) throws Exception {
        when(chatModel.call(any(Prompt.class))).thenThrow(new IllegalStateException(
                "403 PERMISSION_DENIED: API key " + PROVIDER_SECRET + " quota project 12345 exhausted"));

        send(null, "Hi")
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message")
                        .value("The assistant is temporarily unavailable. Please try again shortly."))
                .andExpect(content().string(not(containsString(PROVIDER_SECRET))))
                .andExpect(content().string(not(containsString("PERMISSION_DENIED"))));

        assertThat(log.getOut()).contains("Chatbot unavailable").doesNotContain(PROVIDER_SECRET);
    }

    @Test
    @DisplayName("/api/chat is throttled per minute by the existing Bucket4j filter")
    void rateLimited_perMinute() throws Exception {
        MockMvc throttled = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(rateLimitFilter)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        RequestPostProcessor ip = request -> {
            request.setRemoteAddr("203.0.113.77");
            return request;
        };
        String body = "{\"message\":\"Hi\"}";

        // requests-per-minute=3 here; the per-hour form limit in the test profile is 100.
        for (int i = 0; i < 3; i++) {
            throttled.perform(post(URL).with(ip).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isOk());
        }
        throttled.perform(post(URL).with(ip).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ResultActions send(String sessionId, String message) throws Exception {
        String body = sessionId == null
                ? "{\"message\":\"" + message + "\"}"
                : "{\"sessionId\":\"" + sessionId + "\",\"message\":\"" + message + "\"}";
        return mockMvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private static String sessionIdOf(ResultActions result) throws Exception {
        return JsonPath.read(result.andReturn().getResponse().getContentAsString(), "$.sessionId");
    }

    private static ChatResponse reply(String text) {
        return new ChatResponse(List.of(new Generation(new AssistantMessage(text))));
    }

    private static Document doc(String id, String type, String sourceUrl) {
        return Document.builder().id(id).text(id + " text")
                .metadata(Map.of("type", type, "sourceUrl", sourceUrl, "entityId", 1L)).build();
    }
}
