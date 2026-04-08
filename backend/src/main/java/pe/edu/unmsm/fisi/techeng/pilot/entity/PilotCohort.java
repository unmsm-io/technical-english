package pe.edu.unmsm.fisi.techeng.pilot.entity;

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
        name = "pilot_cohorts",
        indexes = {
                @Index(name = "idx_pilot_cohorts_state", columnList = "state"),
                @Index(name = "idx_pilot_cohorts_created_by", columnList = "createdBy")
        }
)
public class PilotCohort extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CohortState state = CohortState.ENROLLING;

    @Column(nullable = false)
    private Integer targetUserCount;

    @Column(nullable = false)
    private Integer enrolledUserCount = 0;

    private Instant enrollmentStartedAt;

    private Instant interventionStartedAt;

    private Instant postTestStartedAt;

    private Instant completedAt;

    @Column(nullable = false)
    private Long createdBy;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CohortState getState() {
        return state;
    }

    public void setState(CohortState state) {
        this.state = state;
    }

    public Integer getTargetUserCount() {
        return targetUserCount;
    }

    public void setTargetUserCount(Integer targetUserCount) {
        this.targetUserCount = targetUserCount;
    }

    public Integer getEnrolledUserCount() {
        return enrolledUserCount;
    }

    public void setEnrolledUserCount(Integer enrolledUserCount) {
        this.enrolledUserCount = enrolledUserCount;
    }

    public Instant getEnrollmentStartedAt() {
        return enrollmentStartedAt;
    }

    public void setEnrollmentStartedAt(Instant enrollmentStartedAt) {
        this.enrollmentStartedAt = enrollmentStartedAt;
    }

    public Instant getInterventionStartedAt() {
        return interventionStartedAt;
    }

    public void setInterventionStartedAt(Instant interventionStartedAt) {
        this.interventionStartedAt = interventionStartedAt;
    }

    public Instant getPostTestStartedAt() {
        return postTestStartedAt;
    }

    public void setPostTestStartedAt(Instant postTestStartedAt) {
        this.postTestStartedAt = postTestStartedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}
