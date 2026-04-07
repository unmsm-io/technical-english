package pe.edu.unmsm.fisi.techeng.verification.dto;

import java.time.LocalDateTime;

public record VerificationLogEntry(
        Long id,
        String agentName,
        Long latencyMs,
        Integer tokensUsed,
        String verdict,
        String rawResponseJson,
        LocalDateTime createdAt
) {
}
