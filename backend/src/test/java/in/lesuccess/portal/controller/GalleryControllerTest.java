package in.lesuccess.portal.controller;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
import in.lesuccess.portal.gallery.*;
import in.lesuccess.portal.security.JwtAuthenticationFilter;
import in.lesuccess.portal.security.JwtTokenProvider;
import in.lesuccess.portal.shared.exception.GlobalExceptionHandler;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({GalleryController.class, AdminGalleryController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class GalleryControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GalleryService galleryService;

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("Public GET /api/gallery/categories returns categories list")
    void listPublicCategories() throws Exception {
        GalleryCategoryResponse item = GalleryCategoryResponse.builder()
                .id(1L)
                .name("Onam 2026")
                .slug("onam-2026")
                .coverImageUrl("/images/gallery/gallery-1.png")
                .build();

        when(galleryService.listPublicCategories()).thenReturn(List.of(item));

        mockMvc.perform(get("/api/gallery/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Onam 2026"));
    }

    @Test
    @DisplayName("GET /api/admin/gallery/categories without authentication returns 401")
    void listAdminCategoriesUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/gallery/categories"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "TRAINER")
    @DisplayName("GET /api/admin/gallery/categories with TRAINER role returns 403")
    void listAdminCategoriesTrainerForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/gallery/categories"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/gallery/categories with ADMIN role returns 200")
    void listAdminCategoriesAdminSuccess() throws Exception {
        when(galleryService.listAllCategoriesForAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/gallery/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/admin/gallery/images/batch creates multiple images")
    void createBatchImagesSuccess() throws Exception {
        GalleryBatchImageRequest req = GalleryBatchImageRequest.builder()
                .categoryId(1L)
                .imageUrls(List.of("/uploads/gallery/pic1.jpg", "/uploads/gallery/pic2.jpg"))
                .build();

        GalleryImageResponse res1 = GalleryImageResponse.builder().id(10L).categoryId(1L).imageUrl("/uploads/gallery/pic1.jpg").build();
        GalleryImageResponse res2 = GalleryImageResponse.builder().id(11L).categoryId(1L).imageUrl("/uploads/gallery/pic2.jpg").build();

        when(galleryService.createBatchImages(1L, List.of("/uploads/gallery/pic1.jpg", "/uploads/gallery/pic2.jpg")))
                .thenReturn(List.of(res1, res2));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/admin/gallery/images/batch")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2));
    }
}
