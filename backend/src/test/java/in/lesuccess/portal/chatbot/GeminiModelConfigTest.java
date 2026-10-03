package in.lesuccess.portal.chatbot;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class GeminiModelConfigTest {

    @Value("${spring.ai.google.genai.chat.model}")
    private String configuredChatModel;

    @Test
    @DisplayName("spring.ai.google.genai.chat.model defaults to gemini-1.5-flash when unset")
    void geminiModelDefault_shouldBeGemini15Flash() {
        assertThat(configuredChatModel).isEqualTo("gemini-1.5-flash");
    }
}
