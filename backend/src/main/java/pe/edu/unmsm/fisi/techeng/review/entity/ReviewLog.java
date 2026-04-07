package pe.edu.unmsm.fisi.techeng.review.entity;

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
        name = "review_logs",
        indexes = {
                @Index(name = "idx_review_logs_card_reviewed", columnList = "cardId,reviewedAt"),
                @Index(name = "idx_review_logs_user_reviewed", columnList = "userId,reviewedAt")
        }
)
public class ReviewLog extends BaseEntity {

    @Column(nullable = false)
    private Long cardId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ReviewGrade grade;

    @Column(nullable = false)
    private double previousStability;

    @Column(nullable = false)
    private double newStability;

    @Column(nullable = false)
    private double previousDifficulty;

    @Column(nullable = false)
    private double newDifficulty;

    @Column(nullable = false)
    private int elapsedDaysAtReview;

    @Column(nullable = false)
    private int intervalDaysScheduled;

    @Column(nullable = false)
    private Instant reviewedAt;

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ReviewGrade getGrade() {
        return grade;
    }

    public void setGrade(ReviewGrade grade) {
        this.grade = grade;
    }

    public double getPreviousStability() {
        return previousStability;
    }

    public void setPreviousStability(double previousStability) {
        this.previousStability = previousStability;
    }

    public double getNewStability() {
        return newStability;
    }

    public void setNewStability(double newStability) {
        this.newStability = newStability;
    }

    public double getPreviousDifficulty() {
        return previousDifficulty;
    }

    public void setPreviousDifficulty(double previousDifficulty) {
        this.previousDifficulty = previousDifficulty;
    }

    public double getNewDifficulty() {
        return newDifficulty;
    }

    public void setNewDifficulty(double newDifficulty) {
        this.newDifficulty = newDifficulty;
    }

    public int getElapsedDaysAtReview() {
        return elapsedDaysAtReview;
    }

    public void setElapsedDaysAtReview(int elapsedDaysAtReview) {
        this.elapsedDaysAtReview = elapsedDaysAtReview;
    }

    public int getIntervalDaysScheduled() {
        return intervalDaysScheduled;
    }

    public void setIntervalDaysScheduled(int intervalDaysScheduled) {
        this.intervalDaysScheduled = intervalDaysScheduled;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
