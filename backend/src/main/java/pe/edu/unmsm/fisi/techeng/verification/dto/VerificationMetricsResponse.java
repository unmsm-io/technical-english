package pe.edu.unmsm.fisi.techeng.verification.dto;

import java.util.Map;

public record VerificationMetricsResponse(
        long totalGenerated,
        long approvedCount,
        long rejectedCount,
        long pendingCount,
        double approvalRate,
        Map<String, Long> rejectionsByReason,
        Double avgOverallScore,
        long last24hCount
) {
}
