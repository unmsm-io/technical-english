package pe.edu.unmsm.fisi.techeng.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(
        name = "portfolio_snapshots",
        indexes = {
                @Index(name = "idx_portfolio_snapshots_user_computed", columnList = "userId,computedAt"),
                @Index(name = "idx_portfolio_snapshots_type", columnList = "snapshotType")
        }
)
public class PortfolioSnapshot extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private SnapshotType snapshotType;

    @Column(nullable = false)
    private Integer tasksCompleted;

    @Column(nullable = false)
    private Integer tasksWithRewrite;

    @Column(nullable = false)
    private Double rewriteAcceptanceRate;

    @Column(nullable = false)
    private Integer vocabularySize;

    @Column(nullable = false)
    private Integer vocabularyGrowthLast30d;

    @Column(nullable = false)
    private Integer kcMasteredCount;

    @Column(nullable = false)
    private Integer summativeTestsPassed;

    @Column(nullable = false)
    private Double summativeAvgScore;

    private Double abilityTheta;

    @Column(nullable = false)
    private Double abilityComparisonToFirst;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String growthHighlightsJson;

    @Column(nullable = false)
    private Instant computedAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public SnapshotType getSnapshotType() {
        return snapshotType;
    }

    public void setSnapshotType(SnapshotType snapshotType) {
        this.snapshotType = snapshotType;
    }

    public Integer getTasksCompleted() {
        return tasksCompleted;
    }

    public void setTasksCompleted(Integer tasksCompleted) {
        this.tasksCompleted = tasksCompleted;
    }

    public Integer getTasksWithRewrite() {
        return tasksWithRewrite;
    }

    public void setTasksWithRewrite(Integer tasksWithRewrite) {
        this.tasksWithRewrite = tasksWithRewrite;
    }

    public Double getRewriteAcceptanceRate() {
        return rewriteAcceptanceRate;
    }

    public void setRewriteAcceptanceRate(Double rewriteAcceptanceRate) {
        this.rewriteAcceptanceRate = rewriteAcceptanceRate;
    }

    public Integer getVocabularySize() {
        return vocabularySize;
    }

    public void setVocabularySize(Integer vocabularySize) {
        this.vocabularySize = vocabularySize;
    }

    public Integer getVocabularyGrowthLast30d() {
        return vocabularyGrowthLast30d;
    }

    public void setVocabularyGrowthLast30d(Integer vocabularyGrowthLast30d) {
        this.vocabularyGrowthLast30d = vocabularyGrowthLast30d;
    }

    public Integer getKcMasteredCount() {
        return kcMasteredCount;
    }

    public void setKcMasteredCount(Integer kcMasteredCount) {
        this.kcMasteredCount = kcMasteredCount;
    }

    public Integer getSummativeTestsPassed() {
        return summativeTestsPassed;
    }

    public void setSummativeTestsPassed(Integer summativeTestsPassed) {
        this.summativeTestsPassed = summativeTestsPassed;
    }

    public Double getSummativeAvgScore() {
        return summativeAvgScore;
    }

    public void setSummativeAvgScore(Double summativeAvgScore) {
        this.summativeAvgScore = summativeAvgScore;
    }

    public Double getAbilityTheta() {
        return abilityTheta;
    }

    public void setAbilityTheta(Double abilityTheta) {
        this.abilityTheta = abilityTheta;
    }

    public Double getAbilityComparisonToFirst() {
        return abilityComparisonToFirst;
    }

    public void setAbilityComparisonToFirst(Double abilityComparisonToFirst) {
        this.abilityComparisonToFirst = abilityComparisonToFirst;
    }

    public String getGrowthHighlightsJson() {
        return growthHighlightsJson;
    }

    public void setGrowthHighlightsJson(String growthHighlightsJson) {
        this.growthHighlightsJson = growthHighlightsJson;
    }

    public Instant getComputedAt() {
        return computedAt;
    }

    public void setComputedAt(Instant computedAt) {
        this.computedAt = computedAt;
    }
}
