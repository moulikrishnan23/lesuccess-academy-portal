package in.lesuccess.portal.service;

import in.lesuccess.portal.shared.exception.InvalidRequestException;
import in.lesuccess.portal.sitesetting.SiteSetting;
import in.lesuccess.portal.sitesetting.SiteSettingRepository;
import in.lesuccess.portal.sitesetting.SiteSettingService;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.atLeastOnce;

@ExtendWith(MockitoExtension.class)
class SiteSettingServiceTest {

    @Mock
    private SiteSettingRepository repository;

    @InjectMocks
    private SiteSettingService service;

    @Nested
    @DisplayName("Read")
    class GetAllTests {

        @Test
        @DisplayName("Rows collapse into a flat key -> value map")
        void getAll_shouldReturnFlatMap() {
            when(repository.findAll(any(Sort.class))).thenReturn(List.of(
                    buildSetting("email_primary", "hello@lesuccess.in"),
                    buildSetting("phone_primary", "+919000000000")));

            Map<String, String> result = service.getAll();

            assertThat(result)
                    .containsEntry("email_primary", "hello@lesuccess.in")
                    .containsEntry("phone_primary", "+919000000000")
                    .hasSize(2);
        }

        @Test
        @DisplayName("Empty table -> empty map")
        void getAll_empty_shouldReturnEmptyMap() {
            when(repository.findAll(any(Sort.class))).thenReturn(List.of());

            assertThat(service.getAll()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Partial update")
    class UpdateTests {

        @Test
        @DisplayName("Only the supplied keys are written")
        void update_shouldWriteOnlySuppliedKeys() {
            SiteSetting phone = buildSetting("phone_primary", "old");
            when(repository.existsById("phone_primary")).thenReturn(true);
            when(repository.findById("phone_primary")).thenReturn(Optional.of(phone));
            when(repository.findAll(any(Sort.class))).thenReturn(List.of(phone));

            service.updateAll(Map.of("phone_primary", "+919000000000"));

            assertThat(phone.getValue()).isEqualTo("+919000000000");
            // email_primary was never mentioned, so it must never be looked up or written.
            verify(repository, never()).findById("email_primary");
        }

        @Test
        @DisplayName("Unknown key -> 400-shaped InvalidRequestException, nothing written")
        void update_unknownKey_shouldThrowAndWriteNothing() {
            when(repository.existsById("emial_primary")).thenReturn(false);

            assertThatThrownBy(() -> service.updateAll(Map.of("emial_primary", "typo@example.com")))
                    .isInstanceOf(InvalidRequestException.class)
                    .satisfies(ex -> assertThat(((InvalidRequestException) ex).getFieldErrors())
                            .extracting("field").containsExactly("emial_primary"));

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("One unknown key among valid ones rejects the whole batch")
        void update_partiallyUnknown_shouldRejectAll() {
            Map<String, String> updates = new LinkedHashMap<>();
            updates.put("phone_primary", "+919000000000");
            updates.put("nonsense_key", "x");
            when(repository.existsById("phone_primary")).thenReturn(true);
            when(repository.existsById("nonsense_key")).thenReturn(false);

            assertThatThrownBy(() -> service.updateAll(updates))
                    .isInstanceOf(InvalidRequestException.class);

            // All-or-nothing: the valid key must not have been written either.
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Empty map -> InvalidRequestException")
        void update_emptyMap_shouldThrow() {
            assertThatThrownBy(() -> service.updateAll(Map.of()))
                    .isInstanceOf(InvalidRequestException.class);
        }

        @Test
        @DisplayName("Null map -> InvalidRequestException")
        void update_nullMap_shouldThrow() {
            assertThatThrownBy(() -> service.updateAll(null))
                    .isInstanceOf(InvalidRequestException.class);
        }

        @Test
        @DisplayName("Null value -> InvalidRequestException, nothing written")
        void update_nullValue_shouldThrow() {
            Map<String, String> updates = new HashMap<>();
            updates.put("phone_primary", null);

            assertThatThrownBy(() -> service.updateAll(updates))
                    .isInstanceOf(InvalidRequestException.class);

            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Over-long value -> InvalidRequestException")
        void update_tooLongValue_shouldThrow() {
            // No existsById stub on purpose: the length check short-circuits ahead of
            // the key-existence lookup, so stubbing it would be an unused stub.
            assertThatThrownBy(() -> service.updateAll(Map.of("address", "x".repeat(2001))))
                    .isInstanceOf(InvalidRequestException.class);

            verify(repository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Primary Admin contact update validation")
    class ContactUpdateTests {

        @Test
        @DisplayName("Rejects unsafe social URL before writing")
        void rejectsUnsafeSocialUrl() {
            assertThatThrownBy(() -> service.updateContactSettings(Map.of(
                    "social_instagram", "javascript:alert(1)")))
                    .isInstanceOf(InvalidRequestException.class)
                    .satisfies(ex -> assertThat(((InvalidRequestException) ex).getFieldErrors())
                            .extracting("field").containsExactly("social_instagram"));
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Rejects malformed contact email before writing")
        void rejectsInvalidEmail() {
            assertThatThrownBy(() -> service.updateContactSettings(Map.of(
                    "email_primary", "not-an-email")))
                    .isInstanceOf(InvalidRequestException.class);
            verify(repository, never()).save(any());
        }

        @Test
        @DisplayName("Primary phone update also persists the matching WhatsApp URL")
        void phoneUpdateSynchronizesWhatsAppLink() {
            when(repository.existsById(any())).thenReturn(true);
            when(repository.findById(any())).thenAnswer(invocation -> Optional.of(
                    buildSetting(invocation.getArgument(0), "")));
            when(repository.findAll(any(Sort.class))).thenReturn(List.of());

            service.updateContactSettings(Map.of("phone_primary", "+91 80120 60000"));

            ArgumentCaptor<SiteSetting> saved = ArgumentCaptor.forClass(SiteSetting.class);
            verify(repository, atLeastOnce()).save(saved.capture());
            assertThat(saved.getAllValues()).anySatisfy(setting -> {
                assertThat(setting.getKey()).isEqualTo("social_whatsapp");
                assertThat(setting.getValue()).isEqualTo("https://wa.me/918012060000");
            });
        }
    }

    private SiteSetting buildSetting(String key, String value) {
        return SiteSetting.builder()
                .key(key)
                .value(value)
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
