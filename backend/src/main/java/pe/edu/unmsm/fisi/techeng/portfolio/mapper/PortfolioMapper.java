package pe.edu.unmsm.fisi.techeng.portfolio.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.PortfolioSnapshot;

@Component
public class PortfolioMapper {

    public PortfolioDtos.PortfolioResponse toPortfolioResponse(
            PortfolioSnapshot snapshot,
            List<PortfolioDtos.GrowthHighlight> growthHighlights,
            List<PortfolioDtos.PortfolioTimelineEntry> recentTasks
    ) {
        return new PortfolioDtos.PortfolioResponse(
                snapshot.getUserId(),
                snapshot.getTasksCompleted(),
                snapshot.getTasksWithRewrite(),
                snapshot.getRewriteAcceptanceRate(),
                snapshot.getVocabularySize(),
                snapshot.getVocabularyGrowthLast30d(),
                snapshot.getKcMasteredCount(),
                snapshot.getSummativeTestsPassed(),
                snapshot.getSummativeAvgScore(),
                snapshot.getAbilityTheta(),
                snapshot.getAbilityComparisonToFirst(),
                growthHighlights,
                recentTasks,
                snapshot.getComputedAt()
        );
    }

    public PortfolioDtos.PortfolioSnapshotResponse toSnapshotResponse(PortfolioSnapshot snapshot) {
        return new PortfolioDtos.PortfolioSnapshotResponse(
                snapshot.getId(),
                snapshot.getUserId(),
                snapshot.getSnapshotType().name(),
                snapshot.getTasksCompleted(),
                snapshot.getTasksWithRewrite(),
                snapshot.getRewriteAcceptanceRate(),
                snapshot.getVocabularySize(),
                snapshot.getVocabularyGrowthLast30d(),
                snapshot.getKcMasteredCount(),
                snapshot.getSummativeTestsPassed(),
                snapshot.getSummativeAvgScore(),
                snapshot.getAbilityTheta(),
                snapshot.getAbilityComparisonToFirst(),
                snapshot.getComputedAt()
        );
    }
}
