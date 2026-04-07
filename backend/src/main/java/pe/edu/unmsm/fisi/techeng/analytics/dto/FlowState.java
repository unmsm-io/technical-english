package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.time.Instant;

public record FlowState(
        String state,
        String messageEs,
        String recommendation,
        Instant computedAt,
        double recent24hCorrectRate,
        long recent24hAttemptCount,
        long consecutiveAgains,
        long consecutiveEasys
) {
}
