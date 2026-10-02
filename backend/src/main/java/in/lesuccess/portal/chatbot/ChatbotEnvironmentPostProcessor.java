package in.lesuccess.portal.chatbot;

import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.annotation.ImportCandidates;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Makes {@code chatbot.enabled=false} mean "Spring AI is not here at all".
 *
 * <p>{@code @ConditionalOnProperty} on our own beans is not enough. The Spring AI
 * starters register auto-configurations that run whenever their jars are on the
 * classpath: with the flag off, the app would still build Gemini chat and
 * embedding clients, and fail on the missing GEMINI_API_KEY, including in every
 * {@code @SpringBootTest}.</p>
 *
 * <p>So when the flag is off, this adds every {@code org.springframework.ai.*}
 * auto-configuration to {@code spring.autoconfigure.exclude}. It merges with any
 * existing exclusions rather than replacing them. The list is read from the
 * starters' own {@code AutoConfiguration.imports}, so a Spring AI upgrade that adds
 * an auto-configuration is covered without editing this class.</p>
 *
 * <p>Registered in {@code META-INF/spring.factories}.</p>
 */
public class ChatbotEnvironmentPostProcessor implements EnvironmentPostProcessor {

    static final String ENABLED_PROPERTY = "chatbot.enabled";
    private static final String EXCLUDE_PROPERTY = "spring.autoconfigure.exclude";
    private static final String SPRING_AI_PACKAGE = "org.springframework.ai.";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.getProperty(ENABLED_PROPERTY, Boolean.class, false)) {
            return;
        }

        List<String> excludes = new ArrayList<>(Binder.get(environment)
                .bind(EXCLUDE_PROPERTY, Bindable.listOf(String.class))
                .orElse(List.of()));

        ClassLoader classLoader = application != null ? application.getClassLoader() : getClass().getClassLoader();
        ImportCandidates.load(AutoConfiguration.class, classLoader).getCandidates().stream()
                .filter(name -> name.startsWith(SPRING_AI_PACKAGE))
                .filter(name -> !excludes.contains(name))
                .forEach(excludes::add);

        environment.getPropertySources().addFirst(new MapPropertySource(
                "chatbotDisabledExclusions", Map.of(EXCLUDE_PROPERTY, String.join(",", excludes))));
    }
}
