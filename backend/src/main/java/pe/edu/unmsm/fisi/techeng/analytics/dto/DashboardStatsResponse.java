package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.util.Map;

public record DashboardStatsResponse(
        long totalUsers,
        long diagnosticsCompleted,
        double averageVocabularySize,
        Map<String, Long> vocabularyByLayer
) {}
