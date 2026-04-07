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
public class FactualChecker {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model = "gpt-4o-mini";

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public FactualChecker(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClientBuilder = restClientBuilder;
        this.objectMapper = objectMapper;
    }

    public AgentResultDtos.FactualResult verify(GeneratedItem item) {
        try {
            RestClient client = restClientBuilder.baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "List technical factual errors. Return strict JSON with errors and notes."),
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
            List<String> errors = objectMapper.convertValue(parsed.path("errors"), new com.fasterxml.jackson.core.type.TypeReference<>() {});
            int words = Math.max(1, (item.getQuestionTextEn() + " " + item.getExplanationEn()).trim().split("\\s+").length);
            double score = Math.max(0.0d, 1.0d - (errors.size() / Math.max(1.0d, words / 10.0d)));
            return new AgentResultDtos.FactualResult(
                    score,
                    score >= 0.7d,
                    parsed.path("notes").asText(errors.isEmpty() ? "No factual errors found." : String.join("; ", errors)),
                    errors,
                    contentNode.asText(),
                    null
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Factual verification failed", exception);
        }
    }

    private String buildPrompt(GeneratedItem item) {
        return """
                Question:
                %s

                Explanation:
                %s
                """.formatted(item.getQuestionTextEn(), item.getExplanationEn());
    }
}
