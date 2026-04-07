package pe.edu.unmsm.fisi.techeng.task.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
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
class TaskAttemptControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RestClient.Builder restClientBuilder;

    private MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
    }

    @Test
    void shouldStartAdvanceSubmitCompleteAndListHistory() throws Exception {
        User user = new User();
        user.setCodigo("20261234");
        user.setFirstName("Mateo");
        user.setLastName("Lopez");
        user.setEmail("mateo.lopez@unmsm.edu.pe");
        user.setPassword("password123");
        user.setRole(UserRole.STUDENT);
        user.setFaculty("FISI");
        user.setEnglishLevel("B1");
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Task task = taskRepository.findAll().stream()
                .filter(item -> item.getTaskType().name().equals("ERROR_MESSAGE"))
                .findFirst()
                .orElseThrow();

        MvcResult startResult = mockMvc.perform(post("/api/v1/task-attempts")
                        .param("userId", savedUser.getId().toString())
                        .param("taskId", task.getId().toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.phase").value("PRE_TASK"))
                .andReturn();

        JsonNode startJson = objectMapper.readTree(startResult.getResponse().getContentAsString());
        long attemptId = startJson.path("data").path("id").asLong();

        mockMvc.perform(patch("/api/v1/task-attempts/{id}/phase", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PhasePayload("DURING_TASK"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phase").value("DURING_TASK"));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {
                          "choices": [
                            {
                              "message": {
                                "content": "{\"correctness\":91,\"strengths\":[\"Clear explanation\"],\"errors\":[{\"original\":\"error happen\",\"fix\":\"error happens\",\"rule\":\"Use third person singular.\"}],\"improvedAnswer\":\"The error happens because the user is null.\",\"languageFocusComments\":\"Use present simple when describing bugs.\"}"
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        mockMvc.perform(post("/api/v1/task-attempts/{id}/submit", attemptId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitPayload("The error happen because user is null."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.score").value(91))
                .andExpect(jsonPath("$.data.llmFeedbackPayload.improvedAnswer").value("The error happens because the user is null."))
                .andExpect(jsonPath("$.data.postTaskExplanationEs").isNotEmpty());

        mockMvc.perform(patch("/api/v1/task-attempts/{id}/complete", attemptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phase").value("COMPLETED"))
                .andExpect(jsonPath("$.data.completedAt").isNotEmpty());

        mockMvc.perform(get("/api/v1/task-attempts")
                        .param("userId", savedUser.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].taskType").value("ERROR_MESSAGE"))
                .andExpect(jsonPath("$.data[0].score").value(91));

        mockMvc.perform(get("/api/v1/task-attempts/{id}", attemptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phase").value("COMPLETED"));

        server.verify();
    }

    private record PhasePayload(String phase) {}

    private record SubmitPayload(String userAnswerEn) {}
}
