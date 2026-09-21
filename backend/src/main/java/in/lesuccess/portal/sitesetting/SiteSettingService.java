package in.lesuccess.portal.sitesetting;

import in.lesuccess.portal.shared.dto.ApiResponse.FieldError;
import in.lesuccess.portal.shared.exception.InvalidRequestException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository repository;

    /** Longest value the store accepts, so a paste accident cannot fill a TEXT column. */
    private static final int MAX_VALUE_LENGTH = 2000;

    /**
     * Every setting as a flat key -> value map, key-ordered so the response body
     * is byte-stable between calls and stays usefully cacheable.
     */
    @Transactional(readOnly = true)
    public Map<String, String> getAll() {
        Map<String, String> settings = new LinkedHashMap<>();
        repository.findAll(Sort.by("key"))
                .forEach(setting -> settings.put(setting.getKey(), setting.getValue()));
        return settings;
    }

    /**
     * Partial update: only keys present in {@code updates} are written, and each
     * must already exist.
     *
     * <p>Unknown keys are rejected rather than inserted. The vocabulary is seeded
     * by migration and read by name from the frontend, so an upsert would let a
     * typo ({@code emial_primary}) silently create a row nothing reads while the
     * real setting stayed stale. A genuinely new setting is a migration, not an
     * admin PUT.</p>
     *
     * @return the full settings map after the write
     */
    @Transactional
    public Map<String, String> updateAll(Map<String, String> updates) {
        if (updates == null || updates.isEmpty()) {
            throw new InvalidRequestException("At least one setting must be provided");
        }

        List<FieldError> errors = updates.entrySet().stream()
                .map(entry -> validate(entry.getKey(), entry.getValue()))
                .filter(Objects::nonNull)
                .toList();

        if (!errors.isEmpty()) {
            throw new InvalidRequestException("Validation failed", errors);
        }

        updates.forEach((key, value) -> {
            SiteSetting setting = repository.findById(key).orElseThrow();
            setting.setValue(value);
            repository.save(setting);
        });

        log.info("Site settings updated: keys={}", updates.keySet());
        return getAll();
    }

    /** @return a field error, or null when the entry is acceptable. */
    private FieldError validate(String key, String value) {
        if (value == null) {
            return InvalidRequestException.fieldError(key, "Value must not be null");
        }
        if (value.length() > MAX_VALUE_LENGTH) {
            return InvalidRequestException.fieldError(
                    key, "Value must not exceed " + MAX_VALUE_LENGTH + " characters");
        }
        if (!repository.existsById(key)) {
            return InvalidRequestException.fieldError(key, "Unknown setting key");
        }
        return null;
    }
}
