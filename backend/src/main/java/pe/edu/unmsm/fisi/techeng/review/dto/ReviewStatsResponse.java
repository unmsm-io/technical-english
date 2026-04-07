package pe.edu.unmsm.fisi.techeng.review.dto;

import java.util.List;
import java.util.Map;

public record ReviewStatsResponse(
        long totalCards,
        long dueToday,
        long dueTomorrow,
        long dueThisWeek,
        Map<String, Long> byState,
        Map<String, Long> byTier,
        double retentionRate,
        double avgStability,
        int longestStreak,
        List<WeeklyRetentionPoint> weeklyRetention,
        List<TopFailedCard> topFailedCards
) {
    public record WeeklyRetentionPoint(
            String weekLabel,
            double retentionRate
    ) {}

    public record TopFailedCard(
            Long cardId,
            String term,
            int lapses,
            String layer
    ) {}
}
