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

class SolvabilityVerifierTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void verify_shouldScoreOneWhenSelectedOptionMatches() throws Exception {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        SolvabilityVerifier verifier = new SolvabilityVerifier(builder, objectMapper);
        ReflectionTestUtils.setField(verifier, "apiKey", "test-key");
        ReflectionTestUtils.setField(verifier, "baseUrl", "https://llm.test");

        String content = """
                {"selectedIdx":2,"notes":"Option 2 fits the prompt."}
                """;
        String responseBody = objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of("message", Map.of("content", content)))
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        GeneratedItem item = new GeneratedItem();
        item.setQuestionTextEn("Question");
        item.setOptionsJson("[\"A\",\"B\",\"C\"]");
        item.setCorrectAnswerIdx(2);

        AgentResultDtos.SolvabilityResult result = verifier.verify(item);

        assertThat(result.score()).isEqualTo(1.0d);
        assertThat(result.passed()).isTrue();
        server.verify();
    }
}
