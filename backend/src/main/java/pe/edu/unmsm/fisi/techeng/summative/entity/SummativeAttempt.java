package pe.edu.unmsm.fisi.techeng.summative.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(
        name = "summative_attempts",
        indexes = {
                @Index(name = "idx_summative_attempts_user_test", columnList = "userId,summativeTestId"),
                @Index(name = "idx_summative_attempts_phase", columnList = "currentPhase")
        }
)
public class SummativeAttempt extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long summativeTestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private SummativePhase currentPhase;

    @Column(columnDefinition = "TEXT")
    private String productionAnswerEn;

    private Integer productionScore;

    @Column(columnDefinition = "TEXT")
    private String productionFeedbackJson;

    @Column(columnDefinition = "TEXT")
    private String comprehensionResponsesJson;

    private Integer comprehensionScore;

    private Integer overallScore;

    private Boolean passed;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime completedAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSummativeTestId() {
        return summativeTestId;
    }

    public void setSummativeTestId(Long summativeTestId) {
        this.summativeTestId = summativeTestId;
    }

    public SummativePhase getCurrentPhase() {
        return currentPhase;
    }

    public void setCurrentPhase(SummativePhase currentPhase) {
        this.currentPhase = currentPhase;
    }

    public String getProductionAnswerEn() {
        return productionAnswerEn;
    }

    public void setProductionAnswerEn(String productionAnswerEn) {
        this.productionAnswerEn = productionAnswerEn;
    }

    public Integer getProductionScore() {
        return productionScore;
    }

    public void setProductionScore(Integer productionScore) {
        this.productionScore = productionScore;
    }

    public String getProductionFeedbackJson() {
        return productionFeedbackJson;
    }

    public void setProductionFeedbackJson(String productionFeedbackJson) {
        this.productionFeedbackJson = productionFeedbackJson;
    }

    public String getComprehensionResponsesJson() {
        return comprehensionResponsesJson;
    }

    public void setComprehensionResponsesJson(String comprehensionResponsesJson) {
        this.comprehensionResponsesJson = comprehensionResponsesJson;
    }

    public Integer getComprehensionScore() {
        return comprehensionScore;
    }

    public void setComprehensionScore(Integer comprehensionScore) {
        this.comprehensionScore = comprehensionScore;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
