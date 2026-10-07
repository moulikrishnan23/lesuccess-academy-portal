package in.lesuccess.portal.teammember;

import in.lesuccess.portal.config.CorsConfig;
import in.lesuccess.portal.config.SecurityConfig;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TeamMemberController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        CorsConfig.class, GlobalExceptionHandler.class, JacksonAutoConfiguration.class})
@ActiveProfiles("test")
class TeamMemberControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TeamMemberService service;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    @Test
    @DisplayName("Public GET /api/team-members returns active team members")
    void testListActive() throws Exception {
        TeamMemberResponse res = TeamMemberResponse.builder()
                .id(1L)
                .name("Rathinavel Rajagopal")
                .role("Director")
                .department("Management Visionaries")
                .isFeatured(true)
                .build();

        when(service.listActive()).thenReturn(List.of(res));

        mockMvc.perform(get("/api/team-members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Rathinavel Rajagopal"))
                .andExpect(jsonPath("$.data[0].department").value("Management Visionaries"))
                .andExpect(jsonPath("$.data[0].featured").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin POST /api/admin/team-members succeeds with ONLY mandatory Name")
    void testCreateWithOnlyName() throws Exception {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("New Instructor")
                .build();

        TeamMemberResponse response = TeamMemberResponse.builder()
                .id(99L)
                .name("New Instructor")
                .department("Tech Visionaries")
                .isFeatured(false)
                .build();

        when(service.create(any(TeamMemberRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/team-members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Instructor"))
                .andExpect(jsonPath("$.data.department").value("Tech Visionaries"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin POST /api/admin/team-members fails with 400 when Name is blank")
    void testCreateWithBlankNameFails() throws Exception {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("   ")
                .build();

        mockMvc.perform(post("/api/admin/team-members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin PUT /api/admin/team-members/{id} succeeds with updated optional fields")
    void testUpdateMember() throws Exception {
        TeamMemberRequest request = TeamMemberRequest.builder()
                .name("Updated Name")
                .department("Management Visionaries")
                .isFeatured(true)
                .build();

        TeamMemberResponse response = TeamMemberResponse.builder()
                .id(1L)
                .name("Updated Name")
                .department("Management Visionaries")
                .isFeatured(true)
                .build();

        when(service.update(eq(1L), any(TeamMemberRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/admin/team-members/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Name"))
                .andExpect(jsonPath("$.data.department").value("Management Visionaries"))
                .andExpect(jsonPath("$.data.featured").value(true));
    }
}
