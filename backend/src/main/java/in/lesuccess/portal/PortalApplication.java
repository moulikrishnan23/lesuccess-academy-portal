package in.lesuccess.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class PortalApplication {

	public static void main(String[] args) {
		loadDotenvIfPresent();
		SpringApplication.run(PortalApplication.class, args);
	}

	private static void loadDotenvIfPresent() {
		File envFile = new File(".env");
		if (!envFile.exists()) {
			envFile = new File("../.env");
		}
		if (!envFile.exists() || !envFile.isFile()) {
			return;
		}

		try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
			String line;
			while ((line = reader.readLine()) != null) {
				line = line.trim();
				if (line.isEmpty() || line.startsWith("#")) {
					continue;
				}
				int eqIdx = line.indexOf('=');
				if (eqIdx <= 0) {
					continue;
				}
				String key = line.substring(0, eqIdx).trim();
				String val = line.substring(eqIdx + 1).trim();
				if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
					val = val.substring(1, val.length() - 1);
				}
				if (!key.isEmpty() && !val.isEmpty()) {
					if (System.getenv(key) == null && System.getProperty(key) == null) {
						System.setProperty(key, val);
						if ("CHATBOT_ENABLED".equals(key)) {
							System.setProperty("chatbot.enabled", val);
						}
					}
				}
			}
		} catch (Exception ignored) {
			// Silently fall through
		}
	}

}

