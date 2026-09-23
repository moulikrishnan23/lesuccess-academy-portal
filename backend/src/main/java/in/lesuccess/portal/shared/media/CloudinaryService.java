package in.lesuccess.portal.shared.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import in.lesuccess.portal.shared.exception.InvalidRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    @Nullable
    private final Cloudinary cloudinary;

    /**
     * Upload an image file to Cloudinary under the specified folder.
     * Falls back to local disk storage if Cloudinary is not configured.
     *
     * @param file the uploaded multipart file
     * @param folder the target folder in Cloudinary (e.g. "lesuccess/gallery")
     * @return the secure HTTPS URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Cannot upload empty file");
        }

        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image",
                        "overwrite", true
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Uploaded image to Cloudinary [folder={}]: {}", folder, secureUrl);
                return secureUrl;
            } catch (IOException e) {
                log.error("Failed to upload image to Cloudinary", e);
                throw new InvalidRequestException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        }

        return uploadLocally(file, folder);
    }

    /**
     * Upload a video file to Cloudinary under the specified folder.
     */
    public String uploadVideo(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Cannot upload empty file");
        }

        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "video",
                        "overwrite", true
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Uploaded video to Cloudinary [folder={}]: {}", folder, secureUrl);
                return secureUrl;
            } catch (IOException e) {
                log.error("Failed to upload video to Cloudinary", e);
                throw new InvalidRequestException("Failed to upload video to Cloudinary: " + e.getMessage());
            }
        }

        return uploadLocally(file, folder);
    }

    private String uploadLocally(MultipartFile file, String folder) {
        try {
            String subFolder = folder.replace("lesuccess/", "");
            Path uploadDir = Paths.get("uploads", subFolder);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf(".")).toLowerCase();
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + subFolder + "/" + filename;
        } catch (IOException e) {
            throw new InvalidRequestException("Failed to store file locally: " + e.getMessage());
        }
    }
}