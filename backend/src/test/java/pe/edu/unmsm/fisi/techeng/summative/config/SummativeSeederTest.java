package pe.edu.unmsm.fisi.techeng.summative.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class SummativeSeederTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void seedShouldContainSixTestsWithExpectedDistribution() throws Exception {
        try (InputStream inputStream = new ClassPathResource("seeds/summative/tests.json").getInputStream()) {
            JsonNode root = objectMapper.readTree(inputStream);

            assertThat(root).hasSize(6);
            assertThat(root.findValuesAsText("taskType"))
                    .containsExactlyInAnyOrder("ERROR_MESSAGE", "API_DOC", "COMMIT_MSG", "PR_DESC", "CODE_REVIEW", "TECH_REPORT");
            assertThat(root.findValuesAsText("cefrLevel"))
                    .containsExactlyInAnyOrder("A2", "B1", "B1", "B1", "B2", "B2");
            assertThat(root.findValuesAsText("productionInstructionEs")).allMatch(value -> !value.isBlank());
            assertThat(root.findValuesAsText("comprehensionQuestionsJson")).allMatch(value -> value.contains("correctIdx"));
        }
    }
}
