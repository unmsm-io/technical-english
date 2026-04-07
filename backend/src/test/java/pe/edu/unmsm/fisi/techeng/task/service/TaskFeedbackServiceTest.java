package pe.edu.unmsm.fisi.techeng.task.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

class TaskFeedbackServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void generateFeedback_shouldParseJsonResponse() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        TaskFeedbackService service = new TaskFeedbackService(builder, objectMapper);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(service, "baseUrl", "https://llm.test");

        String llmContent = """
                {"correctness":84,"strengths":["Clear cause-effect explanation"],"errors":[{"original":"the error happen","fix":"the error happens","rule":"Use third person singular in present simple."}],"improvedAnswer":"The error happens because the user object is null.","languageFocusComments":"Use present simple for technical explanations."}
                """;
        String responseBody = writeJson(Map.of(
                "choices", List.of(
                        Map.of(
                                "message", Map.of("content", llmContent)
                        )
                )
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        TaskFeedbackPayload payload = service.generateFeedback(sampleTask(), "the error happen because user is null", "A2");

        assertThat(payload.correctness()).isEqualTo(84);
        assertThat(payload.strengths()).contains("Clear cause-effect explanation");
        assertThat(payload.errors()).hasSize(1);
        assertThat(payload.improvedAnswer()).contains("The error happens");
        server.verify();
    }

    @Test
    void generateFeedback_shouldReturnFallbackWhenLlmFails() {
        RestClient.Builder builder = RestClient.builder();
        TaskFeedbackService service = new TaskFeedbackService(builder, objectMapper);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(service, "baseUrl", "http://127.0.0.1:1");

        TaskFeedbackPayload payload = service.generateFeedback(sampleTask(), "answer", "A2");

        assertThat(payload.correctness()).isEqualTo(50);
        assertThat(payload.strengths().getFirst()).contains("No pudimos generar feedback automatico");
        assertThat(payload.improvedAnswer()).isEqualTo(sampleTask().getExpectedAnswerEn());
    }

    private Task sampleTask() {
        Task task = new Task();
        task.setId(1L);
        task.setTaskType(TaskType.ERROR_MESSAGE);
        task.setCefrLevel(CefrLevel.A2);
        task.setTitleEs("Task");
        task.setDescriptionEs("Desc");
        task.setPreTaskContextEn("Context");
        task.setPreTaskGlossesJson("[]");
        task.setDuringTaskPromptEn("Prompt");
        task.setDuringTaskInstructionEs("Instruction");
        task.setExpectedAnswerEn("Reference answer");
        task.setPostTaskLanguageFocus("{\"grammar\":\"present simple\"}");
        task.setPostTaskExplanationEs("Explanation");
        task.setActive(true);
        return task;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
