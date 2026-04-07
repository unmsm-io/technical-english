package pe.edu.unmsm.fisi.techeng.review.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class ReviewControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldBootstrapListDueGradeAndReadStats() throws Exception {
        User user = new User();
        user.setCodigo("20261234");
        user.setFirstName("Rosa");
        user.setLastName("Huaman");
        user.setEmail("rosa.huaman@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
        user.setFaculty("FISI");
        user.setEnglishLevel("B1");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        mockMvc.perform(post("/api/v1/reviews/bootstrap")
                        .param("userId", savedUser.getId().toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.cardsCreated").isNumber())
                .andExpect(jsonPath("$.data.level").value("B1"));

        MvcResult dueResult = mockMvc.perform(get("/api/v1/reviews/due")
                        .param("userId", savedUser.getId().toString())
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(5))
                .andReturn();

        JsonNode dueJson = objectMapper.readTree(dueResult.getResponse().getContentAsString());
        long cardId = dueJson.path("data").get(0).path("id").asLong();
        assertThat(cardId).isPositive();

        mockMvc.perform(post("/api/v1/reviews/{cardId}/grade", cardId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"grade":"GOOD"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.state").isNotEmpty())
                .andExpect(jsonPath("$.data.reps").value(1));

        mockMvc.perform(get("/api/v1/reviews/deck")
                        .param("userId", savedUser.getId().toString())
                        .param("state", "NEW")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").isNumber());

        mockMvc.perform(get("/api/v1/reviews/stats")
                        .param("userId", savedUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCards").isNumber())
                .andExpect(jsonPath("$.data.byTier.GENERAL").isNumber())
                .andExpect(jsonPath("$.data.byState.NEW").isNumber());
    }
}
