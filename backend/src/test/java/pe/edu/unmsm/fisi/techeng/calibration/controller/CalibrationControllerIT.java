package pe.edu.unmsm.fisi.techeng.calibration.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalibrationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldExposeCalibrationStatsItemsAndAbility() throws Exception {
        User user = new User();
        user.setCodigo("20205555");
        user.setFirstName("Jose");
        user.setLastName("Rojas");
        user.setEmail("jose.rojas@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.ADMIN);
        user.setFaculty("FISI");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        MvcResult startResult = mockMvc.perform(post("/api/v1/diagnostic/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartPayload(savedUser.getId()))))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode startJson = objectMapper.readTree(startResult.getResponse().getContentAsString());
        long attemptId = startJson.path("data").path("attemptId").asLong();

        mockMvc.perform(post("/api/v1/diagnostic/attempts/{attemptId}/submit", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitPayload(List.of(
                                1, 0, 1,
                                1, 1, 1,
                                1, 1, 1,
                                1, 1, 0,
                                0, 0, 0
                        )))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.abilityTheta").exists())
                .andExpect(jsonPath("$.data.predictedCefr").exists());

        mockMvc.perform(get("/api/v1/calibration/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems").value(15))
                .andExpect(jsonPath("$.data.byStatus.UNCALIBRATED").value(15));

        mockMvc.perform(get("/api/v1/calibration/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(15))
                .andExpect(jsonPath("$.data[0].status").value("UNCALIBRATED"));

        mockMvc.perform(get("/api/v1/calibration/users/{id}/ability", savedUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(savedUser.getId()))
                .andExpect(jsonPath("$.data.theta").isNumber())
                .andExpect(jsonPath("$.data.predictedCefr").exists());

        mockMvc.perform(post("/api/v1/calibration/run"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.itemsCalibrated").value(0))
                .andExpect(jsonPath("$.data.durationMs").isNumber());
    }

    private record StartPayload(Long userId) {
    }

    private record SubmitPayload(List<Integer> responses) {
    }
}
