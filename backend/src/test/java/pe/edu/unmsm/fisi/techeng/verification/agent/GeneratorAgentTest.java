package pe.edu.unmsm.fisi.techeng.verification.agent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;

class GeneratorAgentTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void generate_shouldParseStructuredJson() throws Exception {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        GeneratorAgent agent = new GeneratorAgent(builder, objectMapper, new ClassPathResource("seeds/verification/few-shot-examples.json"));
        ReflectionTestUtils.setField(agent, "apiKey", "test-key");
        ReflectionTestUtils.setField(agent, "baseUrl", "https://llm.test");

        String content = """
                {"questionTextEn":"What does `NullPointerException` mean?","options":["A","B","C","D"],"correctAnswerIdx":0,"explanationEn":"It means a null reference was used."}
                """;
        String responseBody = objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of("message", Map.of("content", content)))
        ));

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        GeneratorAgent.GenerationResult result = agent.generate(new GenerationRequest(
                1L,
                CefrLevel.A2,
                DiagnosticSkill.VOCAB,
                BloomLevel.REMEMBER,
                "NullPointerException"
        ));

        assertThat(result.questionTextEn()).contains("NullPointerException");
        assertThat(result.options()).hasSize(4);
        assertThat(result.correctAnswerIdx()).isZero();
        server.verify();
    }
}
