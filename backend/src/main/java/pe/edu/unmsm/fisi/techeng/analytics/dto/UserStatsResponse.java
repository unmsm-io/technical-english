package pe.edu.unmsm.fisi.techeng.analytics.dto;

public record UserStatsResponse(
        Long userId,
        long totalAttempts,
        long correctAttempts,
        Double averageScore,
        double accuracyRate
) {}
