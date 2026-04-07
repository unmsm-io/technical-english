package pe.edu.unmsm.fisi.techeng.verification.agent;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;

/**
 * Reuses TokenClassifier from vocabulary module (Sprint 2). Engineering text
 * contains protected tokens (camelCase identifiers, CLI flags, exception names)
 * that must remain literally intact under LLM rewrites. Krashen (1985) input
 * hypothesis + Nguyen & Doan (2025) neuro-ecological update both support that
 * protected technical tokens should not be normalized away.
 */
@Component
public class TokenPreservationGuard {

    private final TokenClassifier tokenClassifier;
    private final ObjectMapper objectMapper;

    public TokenPreservationGuard(TokenClassifier tokenClassifier, ObjectMapper objectMapper) {
        this.tokenClassifier = tokenClassifier;
        this.objectMapper = objectMapper;
    }

    public AgentResultDtos.TokenPreservationResult verify(GeneratedItem item) {
        List<String> protectedTokens = readProtectedTokens(item.getProtectedTokensInQuestion());
        if (protectedTokens.isEmpty()) {
            return new AgentResultDtos.TokenPreservationResult(1.0d, true, "No protected tokens required.", List.of(), "[]");
        }

        String haystack = String.join(
                " ",
                item.getQuestionTextEn() == null ? "" : item.getQuestionTextEn(),
                item.getExplanationEn() == null ? "" : item.getExplanationEn(),
                item.getOptionsJson() == null ? "" : item.getOptionsJson()
        );
        List<String> missingTokens = protectedTokens.stream()
                .filter(tokenClassifier::isProtected)
                .filter(token -> !haystack.contains(token))
                .toList();
        double score = protectedTokens.isEmpty()
                ? 1.0d
                : (protectedTokens.size() - missingTokens.size()) / (double) protectedTokens.size();
        boolean passed = score == 1.0d;
        return new AgentResultDtos.TokenPreservationResult(
                score,
                passed,
                passed ? "All protected tokens were preserved." : "Missing protected tokens: " + String.join(", ", missingTokens),
                missingTokens,
                writeJson(missingTokens)
        );
    }

    private List<String> readProtectedTokens(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo leer los tokens protegidos", exception);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo serializar el guard result", exception);
        }
    }
}
