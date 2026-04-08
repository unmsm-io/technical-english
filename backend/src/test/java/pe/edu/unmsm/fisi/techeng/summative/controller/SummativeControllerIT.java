package pe.edu.unmsm.fisi.techeng.summative.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.service.TaskFeedbackService;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SummativeControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private TaskFeedbackService taskFeedbackService;

    @Test
    void shouldRunSummativeFlowEndToEnd() throws Exception {
        User user = new User();
        user.setCodigo("20261236");
        user.setFirstName("Pia");
        user.setLastName("Ramos");
        user.setEmail("pia.ramos@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
        user.setFaculty("FISI");
        user.setEnglishLevel("B1");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        MvcResult listResult = mockMvc.perform(get("/api/v1/summative/tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(6))
                .andReturn();

        JsonNode content = objectMapper.readTree(listResult.getResponse().getContentAsString())
                .path("data").path("content");
        long testId = 0L;
        for (JsonNode testNode : content) {
            if ("API_DOC".equals(testNode.path("taskType").asText())) {
                testId = testNode.path("id").asLong();
                break;
            }
        }

        MvcResult startResult = mockMvc.perform(post("/api/v1/summative/attempts")
                        .param("userId", savedUser.getId().toString())
                        .param("testId", String.valueOf(testId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.currentPhase").value("READING"))
                .andReturn();

        long attemptId = objectMapper.readTree(startResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        mockMvc.perform(patch("/api/v1/summative/attempts/{id}/phase", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phase\":\"PRODUCTION\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPhase").value("PRODUCTION"));

        when(taskFeedbackService.generateFeedback(any(), eq("This endpoint returns a user profile."), eq("B1")))
                .thenReturn(new TaskFeedbackPayload(
                        90,
                        java.util.List.of("Clear summary"),
                        java.util.List.of(),
                        "This endpoint returns a user profile by id.",
                        "Good precision."
                ));

        mockMvc.perform(post("/api/v1/summative/attempts/{id}/production", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answerEn\":\"This endpoint returns a user profile.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPhase").value("COMPREHENSION"))
                .andExpect(jsonPath("$.data.productionScore").value(90));

        mockMvc.perform(post("/api/v1/summative/attempts/{id}/comprehension", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"answerIdxs\":[1,0,1]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overallScore").isNumber())
                .andExpect(jsonPath("$.data.comprehensionReview.length()").value(3))
                .andExpect(jsonPath("$.data.completedAt").isNotEmpty());

        mockMvc.perform(get("/api/v1/summative/attempts")
                        .param("userId", savedUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/summative/attempts/{id}", attemptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentPhase").value("COMPLETED"));
    }
}
