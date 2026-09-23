package in.lesuccess.portal.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${lesuccess.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${lesuccess.cloudinary.api-key:}")
    private String apiKey;

    @Value("${lesuccess.cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isBlank() || apiKey == null || apiKey.isBlank()) {
            log.warn("Cloudinary credentials not set. Uploads will fall back to local disk storage.");
            return null;
        }
        log.info("Configuring Cloudinary bean for cloud: {}", cloudName);
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}