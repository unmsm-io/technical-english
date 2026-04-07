package pe.edu.unmsm.fisi.techeng.verification.dto;

import java.util.List;

public final class AgentResultDtos {

    private AgentResultDtos() {
    }

    public record SolvabilityResult(
            double score,
            boolean passed,
            String notes,
            String rawResponseJson,
            Integer tokensUsed
    ) {
    }

    public record FactualResult(
            double score,
            boolean passed,
            String notes,
            List<String> errors,
            String rawResponseJson,
            Integer tokensUsed
    ) {
    }

    public record ReasoningResult(
            double score,
            boolean passed,
            String notes,
            String rawResponseJson,
            Integer tokensUsed
    ) {
    }

    public record TokenPreservationResult(
            double score,
            boolean passed,
            String notes,
            List<String> missingTokens,
            String rawResponseJson
    ) {
    }
}
