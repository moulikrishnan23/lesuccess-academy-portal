package in.lesuccess.portal.chatbot;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class ChatbotEnvironmentPostProcessorTest {

    private static final String GEMINI_CHAT = "org.springframework.ai.model.google.genai.autoconfigure.chat.GoogleGenAiChatAutoConfiguration";
    private static final String GEMINI_EMBEDDING = "org.springframework.ai.model.google.genai.autoconfigure.embedding.GoogleGenAiTextEmbeddingAutoConfiguration";
    private static final String GEMINI_EMBEDDING_CONNECTION = "org.springframework.ai.model.google.genai.autoconfigure.embedding.GoogleGenAiEmbeddingConnectionAutoConfiguration";
    private static final String CHAT_MEMORY = "org.springframework.ai.model.chat.memory.autoconfigure.ChatMemoryAutoConfiguration";

    private final ChatbotEnvironmentPostProcessor processor = new ChatbotEnvironmentPostProcessor();

    @Test
    @DisplayName("Flag off (default) → every Spring AI auto-configuration is excluded")
    void disabled_excludesSpringAi() {
        MockEnvironment environment = new MockEnvironment();

        processor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.autoconfigure.exclude"))
                .contains(GEMINI_CHAT, GEMINI_EMBEDDING, GEMINI_EMBEDDING_CONNECTION, CHAT_MEMORY);
    }

    @Test
    @DisplayName("Flag off → existing exclusions are kept, not overwritten")
    void disabled_mergesExistingExclusions() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.autoconfigure.exclude", "com.example.SomethingAutoConfiguration");

        processor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.autoconfigure.exclude"))
                .startsWith("com.example.SomethingAutoConfiguration,")
                .contains(GEMINI_CHAT);
    }

    @Test
    @DisplayName("Flag on → nothing is excluded")
    void enabled_leavesSpringAiAlone() {
        MockEnvironment environment = new MockEnvironment().withProperty("chatbot.enabled", "true");

        processor.postProcessEnvironment(environment, new SpringApplication());

        assertThat(environment.getProperty("spring.autoconfigure.exclude")).isNull();
    }
}
