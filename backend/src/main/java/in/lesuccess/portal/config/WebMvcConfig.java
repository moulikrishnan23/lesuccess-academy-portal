package in.lesuccess.portal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path localUploads = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();
        Path backendUploads = java.nio.file.Paths.get("backend", "uploads").toAbsolutePath().normalize();

        try {
            if (!java.nio.file.Files.exists(localUploads)) {
                java.nio.file.Files.createDirectories(localUploads);
            }
        } catch (java.io.IOException ignored) {
        }

        String loc1 = localUploads.toUri().toString();
        if (!loc1.endsWith("/")) loc1 += "/";

        String loc2 = backendUploads.toUri().toString();
        if (!loc2.endsWith("/")) loc2 += "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(loc1, loc2);
    }
}
