package pe.edu.unmsm.fisi.techeng.verification.agent;

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
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;

class ReasoningValidatorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void verify_shouldReturnPassedWhenExplanationIsValid() throws Exception {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        ReasoningValidator validator = new ReasoningValidator(builder, objectMapper);
        ReflectionTestUtils.setField(validator, "apiKey", "test-key");
        ReflectionTestUtils.setField(validator, "baseUrl", "https://llm.test");

        String content = """
                {"valid":true,"notes":"The explanation supports the selected answer."}
                """;
        String responseBody = objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of("message", Map.of("content", content)))
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        GeneratedItem item = new GeneratedItem();
        item.setCorrectAnswerIdx(1);
        item.setQuestionTextEn("Question");
        item.setExplanationEn("Explanation");

        AgentResultDtos.ReasoningResult result = validator.verify(item);

        assertThat(result.passed()).isTrue();
        assertThat(result.score()).isEqualTo(1.0d);
        server.verify();
    }
}
