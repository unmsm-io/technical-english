package pe.edu.unmsm.fisi.techeng.task.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

/**
 * TBLT 3-phase task structure follows Ellis (2003/2009) and Long (2015). Pre-task
 * framing + during-task performance + post-task language focus. Technology-mediated
 * task sequencing for task attempts is also supported by Bhandari et al. (2025).
 */
@Entity
@Table(
        name = "task_attempts",
        indexes = {
                @Index(name = "idx_task_attempts_user_task", columnList = "userId,taskId"),
                @Index(name = "idx_task_attempts_phase", columnList = "phase")
        }
)
public class TaskAttempt extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long taskId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPhase phase;

    @Column(columnDefinition = "TEXT")
    private String userAnswerEn;

    @Column(columnDefinition = "TEXT")
    private String llmFeedbackJson;

    @Column(length = 5)
    private String llmFeedbackCefr;

    private Integer score;

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

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public TaskPhase getPhase() {
        return phase;
    }

    public void setPhase(TaskPhase phase) {
        this.phase = phase;
    }

    public String getUserAnswerEn() {
        return userAnswerEn;
    }

    public void setUserAnswerEn(String userAnswerEn) {
        this.userAnswerEn = userAnswerEn;
    }

    public String getLlmFeedbackJson() {
        return llmFeedbackJson;
    }

    public void setLlmFeedbackJson(String llmFeedbackJson) {
        this.llmFeedbackJson = llmFeedbackJson;
    }

    public String getLlmFeedbackCefr() {
        return llmFeedbackCefr;
    }

    public void setLlmFeedbackCefr(String llmFeedbackCefr) {
        this.llmFeedbackCefr = llmFeedbackCefr;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
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
