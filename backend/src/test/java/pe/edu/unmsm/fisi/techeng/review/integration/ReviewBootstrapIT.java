package pe.edu.unmsm.fisi.techeng.review.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewBootstrapIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewCardRepository reviewCardRepository;

    @Test
    void diagnosticSubmit_shouldBootstrapReviewCards() throws Exception {
        User user = new User();
        user.setCodigo("20267777");
        user.setFirstName("Mario");
        user.setLastName("Cruz");
        user.setEmail("mario.cruz@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
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
                .andExpect(status().isOk());

        assertThat(reviewCardRepository.countByUserId(savedUser.getId())).isGreaterThan(0);
        assertThat(reviewCardRepository.countByUserIdAndRetentionTier(savedUser.getId(), RetentionTier.GENERAL)).isGreaterThan(0);
        assertThat(reviewCardRepository.countByUserIdAndRetentionTier(savedUser.getId(), RetentionTier.TECHNICAL_CORE)).isGreaterThan(0);
    }

    private record StartPayload(Long userId) {}

    private record SubmitPayload(List<Integer> responses) {}
}
