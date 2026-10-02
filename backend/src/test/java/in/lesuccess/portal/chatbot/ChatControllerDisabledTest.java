package in.lesuccess.portal.chatbot;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * chatbot.enabled=false: the chatbot beans are imported here exactly as in
 * ChatControllerTest, yet none of them load, and /api/chat is a 404.
 */
@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class,
        ChatbotConfig.class, ChatService.class, ChatTools.class})
@ActiveProfiles("test")
@TestPropertySource(properties = "chatbot.enabled=false")
class ChatControllerDisabledTest {

    @Autowired private WebApplicationContext webApplicationContext;
    @Autowired private ApplicationContext context;

    @Test
    @DisplayName("chatbot.enabled=false → POST /api/chat is 404")
    void disabled_returns404() throws Exception {
        MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build()
                .perform(post("/api/chat").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\":\"s-1\",\"message\":\"Hi\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("chatbot.enabled=false → no chatbot bean exists")
    void disabled_loadsNoChatbotBeans() {
        assertThat(context.getBeanNamesForType(ChatController.class)).isEmpty();
        assertThat(context.getBeanNamesForType(ChatService.class)).isEmpty();
        assertThat(context.getBeanNamesForType(ChatTools.class)).isEmpty();
        assertThat(context.getBeanNamesForType(ChatbotConfig.class)).isEmpty();
        assertThat(context.getBeanNamesForType(org.springframework.ai.chat.model.ChatModel.class)).isEmpty();
        assertThat(context.getBeanNamesForType(org.springframework.ai.embedding.EmbeddingModel.class)).isEmpty();
    }
}
