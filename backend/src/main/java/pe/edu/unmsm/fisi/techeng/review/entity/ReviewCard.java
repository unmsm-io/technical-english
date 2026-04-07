package pe.edu.unmsm.fisi.techeng.review.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

/**
 * FSRS-6 spaced repetition algorithm (Ye 2022 KDD, Ye 2023 IEEE TKDE) replaces
 * SM-2 with a stochastic shortest path optimization. Meta-analysis by Kim & Webb
 * (2022) reports d=0.56 effect size for spaced practice over massed practice in
 * L2 vocabulary acquisition.
 */
@Entity
@Table(
        name = "review_cards",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_review_cards_user_vocabulary", columnNames = {"userId", "vocabularyItemId"})
        },
        indexes = {
                @Index(name = "idx_review_cards_user_due", columnList = "userId,due"),
                @Index(name = "idx_review_cards_user_state", columnList = "userId,state")
        }
)
public class ReviewCard extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long vocabularyItemId;

    @Column(nullable = false)
    private double stability = 0.0;

    @Column(nullable = false)
    private double difficulty = 0.0;

    @Column(nullable = false)
    private int elapsedDays = 0;

    @Column(nullable = false)
    private int scheduledDays = 0;

    @Column(nullable = false)
    private int reps = 0;

    @Column(nullable = false)
    private int lapses = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardState state = CardState.NEW;

    private Instant lastReview;

    @Column(nullable = false)
    private Instant due = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RetentionTier retentionTier = RetentionTier.GENERAL;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getVocabularyItemId() {
        return vocabularyItemId;
    }

    public void setVocabularyItemId(Long vocabularyItemId) {
        this.vocabularyItemId = vocabularyItemId;
    }

    public double getStability() {
        return stability;
    }

    public void setStability(double stability) {
        this.stability = stability;
    }

    public double getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(double difficulty) {
        this.difficulty = difficulty;
    }

    public int getElapsedDays() {
        return elapsedDays;
    }

    public void setElapsedDays(int elapsedDays) {
        this.elapsedDays = elapsedDays;
    }

    public int getScheduledDays() {
        return scheduledDays;
    }

    public void setScheduledDays(int scheduledDays) {
        this.scheduledDays = scheduledDays;
    }

    public int getReps() {
        return reps;
    }

    public void setReps(int reps) {
        this.reps = reps;
    }

    public int getLapses() {
        return lapses;
    }

    public void setLapses(int lapses) {
        this.lapses = lapses;
    }

    public CardState getState() {
        return state;
    }

    public void setState(CardState state) {
        this.state = state;
    }

    public Instant getLastReview() {
        return lastReview;
    }

    public void setLastReview(Instant lastReview) {
        this.lastReview = lastReview;
    }

    public Instant getDue() {
        return due;
    }

    public void setDue(Instant due) {
        this.due = due;
    }

    public RetentionTier getRetentionTier() {
        return retentionTier;
    }

    public void setRetentionTier(RetentionTier retentionTier) {
        this.retentionTier = retentionTier;
    }
}
