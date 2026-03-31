package pe.edu.unmsm.fisi.techeng.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import pe.edu.unmsm.fisi.techeng.user.dto.CreateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserResponse;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createUser_shouldReturn201() throws Exception {
        var request = new CreateUserRequest(
                "20200099",
                "Maria",
                "Garcia",
                "maria.garcia@unmsm.edu.pe",
                "password123",
                UserRole.STUDENT,
                "FISI",
                "A2"
        );

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codigo").value("20200099"))
                .andExpect(jsonPath("$.data.firstName").value("Maria"))
                .andExpect(jsonPath("$.data.email").value("maria.garcia@unmsm.edu.pe"));
    }

    @Test
    void createUser_shouldReturn400WhenInvalid() throws Exception {
        var request = new CreateUserRequest(
                "", "", "", "not-an-email", "short", null, null, null
        );

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getUser_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void listUsers_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
