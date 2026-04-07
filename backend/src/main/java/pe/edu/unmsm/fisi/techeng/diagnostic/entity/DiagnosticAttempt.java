package pe.edu.unmsm.fisi.techeng.diagnostic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@Entity
@Table(name = "diagnostic_attempts", indexes = {
        @Index(name = "idx_diagnostic_attempts_user", columnList = "userId"),
        @Index(name = "idx_diagnostic_attempts_level", columnList = "placedLevel")
})
public class DiagnosticAttempt extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String responsesJson;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private CefrLevel placedLevel;

    @Column(nullable = false)
    private Integer correctCount = 0;

    @Column(columnDefinition = "TEXT")
    private String perLevelBreakdownJson;

    @Column(columnDefinition = "TEXT")
    private String perSkillBreakdownJson;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getResponsesJson() {
        return responsesJson;
    }

    public void setResponsesJson(String responsesJson) {
        this.responsesJson = responsesJson;
    }

    public CefrLevel getPlacedLevel() {
        return placedLevel;
    }

    public void setPlacedLevel(CefrLevel placedLevel) {
        this.placedLevel = placedLevel;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public String getPerLevelBreakdownJson() {
        return perLevelBreakdownJson;
    }

    public void setPerLevelBreakdownJson(String perLevelBreakdownJson) {
        this.perLevelBreakdownJson = perLevelBreakdownJson;
    }

    public String getPerSkillBreakdownJson() {
        return perSkillBreakdownJson;
    }

    public void setPerSkillBreakdownJson(String perSkillBreakdownJson) {
        this.perSkillBreakdownJson = perSkillBreakdownJson;
    }
}
