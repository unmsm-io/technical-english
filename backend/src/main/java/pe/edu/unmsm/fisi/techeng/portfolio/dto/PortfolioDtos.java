package pe.edu.unmsm.fisi.techeng.portfolio.dto;

import java.time.Instant;
import java.util.List;

public final class PortfolioDtos {

    private PortfolioDtos() {}

    public record GrowthHighlight(
            String title,
            String beforeText,
            String afterText,
            Instant comparedAt,
            Integer deltaCount
    ) {}

    public record PortfolioTimelineEntry(
            String type,
            Instant date,
            String title,
            Integer score,
            String snippet
    ) {}

    public record PortfolioTimelineResponse(
            Long userId,
            List<PortfolioTimelineEntry> entries
    ) {}

    public record PortfolioSnapshotResponse(
            Long id,
            Long userId,
            String snapshotType,
            Integer tasksCompleted,
            Integer tasksWithRewrite,
            Double rewriteAcceptanceRate,
            Integer vocabularySize,
            Integer vocabularyGrowthLast30d,
            Integer kcMasteredCount,
            Integer summativeTestsPassed,
            Double summativeAvgScore,
            Double abilityTheta,
            Double abilityComparisonToFirst,
            Instant computedAt
    ) {}

    public record PortfolioResponse(
            Long userId,
            Integer tasksCompleted,
            Integer tasksWithRewrite,
            Double rewriteAcceptanceRate,
            Integer vocabularySize,
            Integer vocabularyGrowthLast30d,
            Integer kcMasteredCount,
            Integer summativeTestsPassed,
            Double summativeAvgScore,
            Double abilityTheta,
            Double abilityComparisonToFirst,
            List<GrowthHighlight> growthHighlights,
            List<PortfolioTimelineEntry> recentTasks,
            Instant computedAt
    ) {}
}
