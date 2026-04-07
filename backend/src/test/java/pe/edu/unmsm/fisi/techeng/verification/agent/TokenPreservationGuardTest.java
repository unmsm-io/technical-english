package pe.edu.unmsm.fisi.techeng.verification.agent;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;

class TokenPreservationGuardTest {

    private final TokenPreservationGuard guard = new TokenPreservationGuard(new TokenClassifier(), new ObjectMapper());

    @Test
    void verify_shouldRejectWhenProtectedTokenIsMissing() throws Exception {
        GeneratedItem item = new GeneratedItem();
        item.setProtectedTokensInQuestion(new ObjectMapper().writeValueAsString(List.of("NullPointerException")));
        item.setQuestionTextEn("What does a null reference mean?");
        item.setExplanationEn("The error happens when an object is null.");
        item.setOptionsJson("[\"A\",\"B\"]");

        AgentResultDtos.TokenPreservationResult result = guard.verify(item);

        assertThat(result.passed()).isFalse();
        assertThat(result.missingTokens()).contains("NullPointerException");
    }
}
