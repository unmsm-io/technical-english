package pe.edu.unmsm.fisi.techeng.diagnostic;

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
class DiagnosticFlowIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldStartSubmitAndPersistPlacement() throws Exception {
        User user = new User();
        user.setCodigo("20209999");
        user.setFirstName("Lucia");
        user.setLastName("Quispe");
        user.setEmail("lucia.quispe@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
        user.setFaculty("FISI");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        MvcResult startResult = mockMvc.perform(post("/api/v1/diagnostic/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartPayload(savedUser.getId()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.items.length()").value(15))
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
                .andExpect(jsonPath("$.data.placedLevel").value("B2"))
                .andExpect(jsonPath("$.data.correctCount").value(12))
                .andExpect(jsonPath("$.data.vocabularySize").value(3500))
                .andExpect(jsonPath("$.data.perLevelBreakdown.B2").value(3))
                .andExpect(jsonPath("$.data.perLevelBreakdown.C1").value(0));

        mockMvc.perform(get("/api/v1/users/{id}", savedUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.englishLevel").value("B2"))
                .andExpect(jsonPath("$.data.diagnosticCompleted").value(true))
                .andExpect(jsonPath("$.data.vocabularySize").value(3500));

        mockMvc.perform(get("/api/v1/diagnostic/attempts")
                        .param("userId", savedUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].placedLevel").value("B2"));
    }

    private record StartPayload(Long userId) {}

    private record SubmitPayload(List<Integer> responses) {}
}
