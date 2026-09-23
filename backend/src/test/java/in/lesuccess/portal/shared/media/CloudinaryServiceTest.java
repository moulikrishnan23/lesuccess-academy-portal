package in.lesuccess.portal.shared.media;

import in.lesuccess.portal.shared.exception.InvalidRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CloudinaryServiceTest {

    @Test
    @DisplayName("Should throw InvalidRequestException on empty file")
    void shouldThrowOnEmptyFile() {
        CloudinaryService service = new CloudinaryService(null);
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);

        assertThatThrownBy(() -> service.uploadImage(emptyFile, "lesuccess/gallery"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Cannot upload empty file");
    }

    @Test
    @DisplayName("Should fallback to local disk when Cloudinary client is not configured")
    void shouldFallbackToLocalDiskWhenCloudinaryNull() {
        CloudinaryService service = new CloudinaryService(null);
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png", "sample-image-data".getBytes());

        String result = service.uploadImage(file, "lesuccess/gallery");

        assertThat(result).isNotNull();
        assertThat(result).startsWith("/uploads/gallery/");
        assertThat(result).endsWith(".png");
    }
}