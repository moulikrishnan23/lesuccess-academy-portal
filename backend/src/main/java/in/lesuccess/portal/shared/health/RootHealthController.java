package in.lesuccess.portal.shared.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class RootHealthController {

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<Map<String, Object>> rootHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "LeSuccess Academy Portal API",
                "timestamp", Instant.now().toString()
        ));
    }
}
