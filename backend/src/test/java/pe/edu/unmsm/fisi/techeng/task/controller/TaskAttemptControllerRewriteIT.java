package pe.edu.unmsm.fisi.techeng.task.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.task.service.TaskFeedbackService;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "llm.base-url=https://llm.test",
        "llm.api-key=test-key",
        "llm.model=gpt-4o-mini"
})
class TaskAttemptControllerRewriteIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @MockBean
    private TaskFeedbackService taskFeedbackService;

    @Test
    void shouldSubmitRewriteAndExposeRewriteFieldsInAttempt() throws Exception {
        User user = new User();
        user.setCodigo("20261235");
        user.setFirstName("Lucia");
        user.setLastName("Perez");
        user.setEmail("lucia.perez@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
        user.setFaculty("FISI");
        user.setEnglishLevel("B1");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Task task = taskRepository.findAll().stream()
                .filter(item -> item.getTaskType().name().equals("COMMIT_MSG"))
                .findFirst()
                .orElseThrow();

        MvcResult startResult = mockMvc.perform(post("/api/v1/task-attempts")
                        .param("userId", savedUser.getId().toString())
                        .param("taskId", task.getId().toString()))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode startJson = objectMapper.readTree(startResult.getResponse().getContentAsString());
        long attemptId = startJson.path("data").path("id").asLong();

        mockMvc.perform(patch("/api/v1/task-attempts/{id}/phase", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PhasePayload("DURING_TASK"))))
                .andExpect(status().isOk());

        when(taskFeedbackService.generateFeedback(any(Task.class), eq("fix token bug"), eq("B1")))
                .thenReturn(new TaskFeedbackPayload(
                        58,
                        java.util.List.of("Basic intent"),
                        java.util.List.of(),
                        "fix auth token expiration handling",
                        "Use concise commit style."
                ));

        mockMvc.perform(post("/api/v1/task-attempts/{id}/submit", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitPayload("fix token bug"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(58));

        when(taskFeedbackService.generateFeedback(any(Task.class), eq("fix auth token expiration handling in login flow"), eq("B1")))
                .thenReturn(new TaskFeedbackPayload(
                        84,
                        java.util.List.of("Clear action"),
                        java.util.List.of(),
                        "fix auth token expiration handling in login flow",
                        "Good imperative verb and scope."
                ));

        mockMvc.perform(post("/api/v1/task-attempts/{id}/rewrite", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RewritePayload("fix auth token expiration handling in login flow"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(84))
                .andExpect(jsonPath("$.data.userAnswerEn").value("fix auth token expiration handling in login flow"));

        mockMvc.perform(post("/api/v1/task-attempts/{id}/rewrite", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RewritePayload("fix auth token expiration handling in login flow"))))
                .andExpect(status().isConflict());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/task-attempts/{id}", attemptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rewriteAnswerEn").value("fix auth token expiration handling in login flow"))
                .andExpect(jsonPath("$.data.rewriteScore").value(84))
                .andExpect(jsonPath("$.data.rewriteAccepted").value(true))
                .andExpect(jsonPath("$.data.rewriteSubmittedAt").isNotEmpty())
                .andExpect(jsonPath("$.data.rewriteFeedbackPayload.improvedAnswer").value("fix auth token expiration handling in login flow"));
    }

    private record PhasePayload(String phase) {}

    private record SubmitPayload(String userAnswerEn) {}

    private record RewritePayload(String rewriteAnswerEn) {}
}
