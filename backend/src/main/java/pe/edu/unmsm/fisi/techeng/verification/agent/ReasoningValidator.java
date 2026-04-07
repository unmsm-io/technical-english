package pe.edu.unmsm.fisi.techeng.verification.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;

@Component
public class ReasoningValidator {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model = "gpt-4o-mini";

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public ReasoningValidator(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClientBuilder = restClientBuilder;
        this.objectMapper = objectMapper;
    }

    public AgentResultDtos.ReasoningResult verify(GeneratedItem item) {
        try {
            RestClient client = restClientBuilder.baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "Check if the explanation logically supports the correct option. Return strict JSON with valid and notes."),
                            Map.of("role", "user", "content", buildPrompt(item))
                    ),
                    "temperature", 0.1d,
                    "response_format", Map.of("type", "json_object")
            );
            String responseBody = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode contentNode = objectMapper.readTree(responseBody)
                    .path("choices").get(0).path("message").path("content");
            JsonNode parsed = objectMapper.readTree(contentNode.asText());
            boolean valid = parsed.path("valid").asBoolean(false);
            return new AgentResultDtos.ReasoningResult(
                    valid ? 1.0d : 0.0d,
                    valid,
                    parsed.path("notes").asText(),
                    contentNode.asText(),
                    null
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Reasoning verification failed", exception);
        }
    }

    private String buildPrompt(GeneratedItem item) {
        return """
                Correct option index: %s
                Question:
                %s

                Explanation:
                %s
                """.formatted(item.getCorrectAnswerIdx(), item.getQuestionTextEn(), item.getExplanationEn());
    }
}
