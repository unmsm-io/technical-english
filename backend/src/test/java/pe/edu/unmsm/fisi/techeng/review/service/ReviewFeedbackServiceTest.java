package pe.edu.unmsm.fisi.techeng.review.service;

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
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;

class ReviewFeedbackServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void generateFeedback_shouldParseJsonResponse() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        ReviewFeedbackService service = new ReviewFeedbackService(builder, objectMapper);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "baseUrl", "https://llm.test");

        String llmContent = """
                {"comment":"Good use of the target term in context.","correctedSentence":null,"isCorrect":true}
                """;
        String responseBody = writeJson(Map.of(
                "choices", List.of(Map.of("message", Map.of("content", llmContent)))
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        ReviewFeedbackPayload payload = service.generateFeedback(sampleItem(), "The framework handles the request.", ReviewGrade.GOOD, "A2");

        assertThat(payload.comment()).contains("Good use");
        assertThat(payload.correctedSentence()).isNull();
        assertThat(payload.isCorrect()).isTrue();
        server.verify();
    }

    @Test
    void generateFeedback_shouldReturnFallbackWhenLlmFails() {
        RestClient.Builder builder = RestClient.builder();
        ReviewFeedbackService service = new ReviewFeedbackService(builder, objectMapper);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "baseUrl", "http://127.0.0.1:1");

        ReviewFeedbackPayload payload = service.generateFeedback(sampleItem(), "Answer", ReviewGrade.GOOD, "A2");

        assertThat(payload.comment()).isEqualTo("No pudimos verificar tu ejemplo en este momento.");
        assertThat(payload.correctedSentence()).isNull();
        assertThat(payload.isCorrect()).isTrue();
    }

    private VocabularyItem sampleItem() {
        VocabularyItem item = new VocabularyItem();
        item.setId(1L);
        item.setTerm("framework");
        item.setDefinition("A reusable software structure.");
        item.setCefrLevel(CefrLevel.A2);
        item.setLayer(VocabularyLayer.AWL);
        item.setFrequency(20);
        item.setPartOfSpeech("noun");
        item.setExampleSentence("This framework speeds up development.");
        item.setProtectedToken(false);
        return item;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
