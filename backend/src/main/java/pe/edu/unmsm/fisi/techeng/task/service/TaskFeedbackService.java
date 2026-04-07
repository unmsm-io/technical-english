package pe.edu.unmsm.fisi.techeng.task.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;

/**
 * CEFR-calibrated feedback complexity scales with learner level. Mohamed et al. (2025)
 * found A2 learners get the highest gain from focused single-error feedback, while B1+
 * benefit from holistic multi-dimensional review.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskFeedbackService {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model;

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public TaskFeedbackPayload generateFeedback(Task task, String userAnswerEn, String userCefrLevel) {
        try {
            RestClient client = restClientBuilder
                    .baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", buildSystemPrompt(userCefrLevel)),
                            Map.of("role", "user", "content", buildUserPrompt(task, userAnswerEn))
                    ),
                    "temperature", 0.3,
                    "response_format", Map.of("type", "json_object")
            );

            String response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode contentNode = objectMapper.readTree(response)
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content");

            return objectMapper.readValue(contentNode.asText(), TaskFeedbackPayload.class);
        } catch (Exception exception) {
            log.error("Task feedback generation failed for task {}", task.getId(), exception);
            return fallbackPayload(task);
        }
    }

    private String buildSystemPrompt(String userCefrLevel) {
        return """
                You are a CEFR-calibrated English feedback engine for engineering students.
                The student is at level %s. Calibrate complexity:
                - A1/A2: simple, one-error-at-a-time feedback in English. Avoid jargon.
                - B1: moderate complexity, 2-3 dimensions (grammar, vocabulary, clarity).
                - B2/C1/C2: holistic feedback including discourse markers and register.
                Always return strict JSON with no markdown.
                """.formatted(userCefrLevel);
    }

    private String buildUserPrompt(Task task, String userAnswerEn) {
        return """
                Task type: %s
                Task instruction (Spanish): %s
                Task input (English): %s
                Reference answer (English): %s
                Language focus to highlight: %s
                Student answer: %s

                Return JSON with:
                {
                  "correctness": 0-100,
                  "strengths": ["..."],
                  "errors": [{"original": "...", "fix": "...", "rule": "..."}],
                  "improvedAnswer": "...",
                  "languageFocusComments": "..."
                }
                """.formatted(
                task.getTaskType(),
                task.getDuringTaskInstructionEs(),
                task.getDuringTaskPromptEn(),
                task.getExpectedAnswerEn(),
                task.getPostTaskLanguageFocus(),
                userAnswerEn
        );
    }

    private TaskFeedbackPayload fallbackPayload(Task task) {
        return new TaskFeedbackPayload(
                50,
                List.of("No pudimos generar feedback automatico en este momento."),
                List.of(),
                task.getExpectedAnswerEn(),
                "No pudimos generar feedback automatico en este momento. Revisa la respuesta de referencia y vuelve a intentarlo mas tarde."
        );
    }
}
