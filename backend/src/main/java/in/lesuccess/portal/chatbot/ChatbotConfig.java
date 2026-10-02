package in.lesuccess.portal.chatbot;

import com.github.benmanes.caffeine.cache.Ticker;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;

/**
 * Wires the chatbot. Loads only with {@code chatbot.enabled=true}. With the flag
 * off, Spring AI's own auto-configuration is excluded too (see
 * {@link ChatbotEnvironmentPostProcessor}).
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "chatbot.enabled", havingValue = "true")
public class ChatbotConfig {

    static final int MEMORY_MAX_MESSAGES = 10;
    static final int RETRIEVAL_TOP_K = 4;
    static final double RETRIEVAL_SIMILARITY_THRESHOLD = 0.5;

    /** A visitor who goes quiet this long starts a fresh conversation. */
    private static final Duration MEMORY_IDLE_TIMEOUT = Duration.ofMinutes(30);
    private static final long MEMORY_MAX_SESSIONS = 10_000;

    /**
     * Fails startup when the flag is on but the key is missing. The {@code @Value}
     * has no default, so an unset GEMINI_API_KEY already fails here with Spring's
     * "Could not resolve placeholder" naming the variable. The blank check catches
     * {@code GEMINI_API_KEY=""}, which would otherwise start fine and then return
     * 503 on every message.
     */
    public ChatbotConfig(@Value("${spring.ai.google.genai.api-key}") String geminiApiKey,
                         Map<String, EmbeddingModel> embeddingModels) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException(
                    "chatbot.enabled=true but GEMINI_API_KEY is blank. Set it, or set CHATBOT_ENABLED=false.");
        }
        // The index and every query must be embedded by the same model; with two
        // beans, the indexer and the advisor could each bind a different one.
        if (embeddingModels.size() != 1) {
            throw new IllegalStateException(
                    "Chatbot expects exactly one EmbeddingModel bean but found " + embeddingModels.keySet()
                            + ". Disable the extra provider with spring.ai.model.embedding.text.");
        }
    }

    @Bean
    public DelegatingVectorStore chatKnowledgeVectorStore(ChatKnowledgeIndexer indexer) {
        return new DelegatingVectorStore(indexer::currentStore);
    }

    /**
     * Issued sessions and their memory, expiring together. Declared here so Spring
     * AI's unbounded InMemoryChatMemoryRepository is never created. A Ticker bean
     * exists only in tests, to expire sessions without waiting.
     */
    @Bean
    public ExpiringChatMemoryRepository chatMemoryRepository(ObjectProvider<Ticker> ticker) {
        return new ExpiringChatMemoryRepository(MEMORY_IDLE_TIMEOUT, MEMORY_MAX_SESSIONS,
                ticker.getIfAvailable(Ticker::systemTicker));
    }

    @Bean
    public ChatMemory chatMemory(ChatMemoryRepository chatMemoryRepository) {
        return MessageWindowChatMemory.builder()
                .chatMemoryRepository(chatMemoryRepository)
                .maxMessages(MEMORY_MAX_MESSAGES)
                .build();
    }

    @Bean
    public ChatClient chatbotChatClient(Map<String, ChatModel> chatModels,
                                        ChatClient.Builder builder,
                                        ChatMemory chatMemory,
                                        DelegatingVectorStore knowledgeStore,
                                        ChatTools chatTools) {
        // Guard against a future starter quietly adding a second provider. Calls
        // would then go to whichever model the autoconfigured builder happened to bind.
        if (chatModels.size() != 1) {
            throw new IllegalStateException(
                    "Chatbot expects exactly one ChatModel bean but found " + chatModels.keySet()
                            + ". Disable the extra provider with spring.ai.model.chat.");
        }

        return builder
                .defaultSystem(ChatbotPromptConfig.SYSTEM_PROMPT)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build(),
                        QuestionAnswerAdvisor.builder(knowledgeStore)
                                .searchRequest(SearchRequest.builder()
                                        .topK(RETRIEVAL_TOP_K)
                                        .similarityThreshold(RETRIEVAL_SIMILARITY_THRESHOLD)
                                        .build())
                                .promptTemplate(new PromptTemplate(ChatbotPromptConfig.RETRIEVAL_PROMPT_TEMPLATE))
                                .build())
                .defaultTools(chatTools)
                .build();
    }
}
