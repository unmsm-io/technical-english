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

class FactualCheckerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void verify_shouldComputeScoreFromReturnedErrors() throws Exception {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        FactualChecker checker = new FactualChecker(builder, objectMapper);
        ReflectionTestUtils.setField(checker, "apiKey", "test-key");
        ReflectionTestUtils.setField(checker, "baseUrl", "https://llm.test");

        String content = """
                {"errors":["HTTP 401 does not mean forbidden"],"notes":"One factual problem found."}
                """;
        String responseBody = objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of("message", Map.of("content", content)))
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        GeneratedItem item = new GeneratedItem();
        item.setQuestionTextEn("A REST API returns 401 when the user is authenticated and already authorized.");
        item.setExplanationEn("The explanation repeats the same claim.");

        AgentResultDtos.FactualResult result = checker.verify(item);

        assertThat(result.errors()).hasSize(1);
        assertThat(result.score()).isLessThan(1.0d);
        server.verify();
    }
}
