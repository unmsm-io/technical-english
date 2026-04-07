package pe.edu.unmsm.fisi.techeng.verification.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;

@Component
public class GeneratorAgent {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;
    private final Resource fewShotExamples;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model = "gpt-4o-mini";

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public GeneratorAgent(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("classpath:seeds/verification/few-shot-examples.json") Resource fewShotExamples
    ) {
        this.restClientBuilder = restClientBuilder;
        this.objectMapper = objectMapper;
        this.fewShotExamples = fewShotExamples;
    }

    public GenerationResult generate(GenerationRequest request) {
        try {
            RestClient client = restClientBuilder.baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt(request)),
                            Map.of("role", "user", "content", userPrompt(request))
                    ),
                    "temperature", 0.7d,
                    "response_format", Map.of("type", "json_object")
            );

            String responseBody = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode contentNode = objectMapper.readTree(responseBody)
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content");
            JsonNode contentJson = objectMapper.readTree(contentNode.asText());
            return new GenerationResult(
                    contentJson.path("questionTextEn").asText(),
                    readOptions(contentJson.path("options")),
                    contentJson.path("correctAnswerIdx").asInt(),
                    contentJson.path("explanationEn").asText(),
                    contentNode.asText()
            );
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer el few-shot seed", exception);
        }
    }

    private String systemPrompt(GenerationRequest request) throws IOException {
        return """
                You are a CEFR-%s diagnostic question generator for software engineering students.
                Generate exactly one multiple-choice question at Bloom level %s.
                Use realistic engineering content, preserve any protected technical tokens from the topic hint exactly,
                and return strict JSON with keys questionTextEn, options, correctAnswerIdx, explanationEn.
                """.formatted(request.targetCefrLevel(), request.bloomLevel());
    }

    private String userPrompt(GenerationRequest request) throws IOException {
        return """
                Target CEFR: %s
                Skill: %s
                Bloom level: %s
                Topic hint: %s

                Few-shot examples:
                %s
                """.formatted(
                request.targetCefrLevel(),
                request.targetSkill(),
                request.bloomLevel(),
                request.topicHint() == null ? "" : request.topicHint(),
                fewShotExamples.getContentAsString(StandardCharsets.UTF_8)
        );
    }

    private List<String> readOptions(JsonNode optionsNode) {
        return objectMapper.convertValue(optionsNode, new com.fasterxml.jackson.core.type.TypeReference<>() {});
    }

    public record GenerationResult(
            String questionTextEn,
            List<String> options,
            Integer correctAnswerIdx,
            String explanationEn,
            String rawResponseJson
    ) {
    }
}
