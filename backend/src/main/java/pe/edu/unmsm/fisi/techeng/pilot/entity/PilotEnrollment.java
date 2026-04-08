package pe.edu.unmsm.fisi.techeng.pilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(
        name = "pilot_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_pilot_enrollments_cohort_user", columnNames = {"cohortId", "userId"})
        },
        indexes = {
                @Index(name = "idx_pilot_enrollments_cohort", columnList = "cohortId"),
                @Index(name = "idx_pilot_enrollments_user", columnList = "userId")
        }
)
public class PilotEnrollment extends BaseEntity {

    @Column(nullable = false)
    private Long cohortId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Instant enrolledAt;

    private Long preTestDiagnosticAttemptId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String preTestSummativeAttemptIds;

    private Long postTestDiagnosticAttemptId;

    @Column(columnDefinition = "TEXT")
    private String postTestSummativeAttemptIds;

    private Instant firstActionAt;

    private Instant lastActionAt;

    @Column(nullable = false)
    private Integer actionsCount = 0;

    public Long getCohortId() {
        return cohortId;
    }

    public void setCohortId(Long cohortId) {
        this.cohortId = cohortId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(Instant enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public Long getPreTestDiagnosticAttemptId() {
        return preTestDiagnosticAttemptId;
    }

    public void setPreTestDiagnosticAttemptId(Long preTestDiagnosticAttemptId) {
        this.preTestDiagnosticAttemptId = preTestDiagnosticAttemptId;
    }

    public String getPreTestSummativeAttemptIds() {
        return preTestSummativeAttemptIds;
    }

    public void setPreTestSummativeAttemptIds(String preTestSummativeAttemptIds) {
        this.preTestSummativeAttemptIds = preTestSummativeAttemptIds;
    }

    public Long getPostTestDiagnosticAttemptId() {
        return postTestDiagnosticAttemptId;
    }

    public void setPostTestDiagnosticAttemptId(Long postTestDiagnosticAttemptId) {
        this.postTestDiagnosticAttemptId = postTestDiagnosticAttemptId;
    }

    public String getPostTestSummativeAttemptIds() {
        return postTestSummativeAttemptIds;
    }

    public void setPostTestSummativeAttemptIds(String postTestSummativeAttemptIds) {
        this.postTestSummativeAttemptIds = postTestSummativeAttemptIds;
    }

    public Instant getFirstActionAt() {
        return firstActionAt;
    }

    public void setFirstActionAt(Instant firstActionAt) {
        this.firstActionAt = firstActionAt;
    }

    public Instant getLastActionAt() {
        return lastActionAt;
    }

    public void setLastActionAt(Instant lastActionAt) {
        this.lastActionAt = lastActionAt;
    }

    public Integer getActionsCount() {
        return actionsCount;
    }

    public void setActionsCount(Integer actionsCount) {
        this.actionsCount = actionsCount;
    }
}
