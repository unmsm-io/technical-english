package pe.edu.unmsm.fisi.techeng.review.service;

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
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;

/**
 * CEFR-calibrated short feedback for vocabulary cards. Distinct from
 * TaskFeedbackService which handles longer TBLT task answers. Uses gpt-4o-mini
 * with focused single-sentence prompt. Mohamed et al. (2025) showed A2 learners
 * gain most from focused single-error feedback.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewFeedbackService {

    private static final ReviewFeedbackPayload FALLBACK_PAYLOAD = new ReviewFeedbackPayload(
            "No pudimos verificar tu ejemplo en este momento.",
            null,
            true
    );

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public ReviewFeedbackPayload generateFeedback(
            VocabularyItem item,
            String userInput,
            ReviewGrade selfGrade,
            String userCefrLevel
    ) {
        try {
            RestClient client = restClientBuilder
                    .baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();

            Map<String, Object> payload = Map.of(
                    "model", "gpt-4o-mini",
                    "messages", List.of(
                            Map.of("role", "system", "content", buildSystemPrompt(userCefrLevel)),
                            Map.of("role", "user", "content", buildUserPrompt(item, userInput, selfGrade))
                    ),
                    "temperature", 0.2,
                    "response_format", Map.of("type", "json_object")
            );

            String response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            JsonNode contentNode = objectMapper.readTree(response)
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content");

            return objectMapper.readValue(contentNode.asText(), ReviewFeedbackPayload.class);
        } catch (Exception exception) {
            log.error("Review feedback generation failed for term {}", item.getTerm(), exception);
            return FALLBACK_PAYLOAD;
        }
    }

    private String buildSystemPrompt(String userCefrLevel) {
        return """
                You are a CEFR-%s vocabulary coach for engineering students.
                Give a one or two sentence comment in English about whether the student's example sentence uses the target word correctly.
                If it is wrong, provide one corrected sentence.
                Return strict JSON with keys comment, correctedSentence and isCorrect.
                """.formatted(userCefrLevel);
    }

    private String buildUserPrompt(VocabularyItem item, String userInput, ReviewGrade selfGrade) {
        return """
                Term: %s (%s)
                Definition: %s
                Example: %s
                Student wrote: %s
                Self-grade: %s
                """.formatted(
                item.getTerm(),
                item.getPartOfSpeech(),
                item.getDefinition(),
                item.getExampleSentence(),
                userInput,
                selfGrade.name()
        );
    }
}
