package pe.edu.unmsm.fisi.techeng.kc.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

/**
 * Per-user-per-KC learning state. Mastery threshold P(L) >= 0.95 follows the
 * standard convention from Corbett & Anderson and is empirically validated as
 * the point where students reliably retain skills.
 */
@Entity
@Table(
        name = "kc_mastery_states",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_kc_mastery_user_kc", columnNames = {"userId", "kcId"})
        },
        indexes = {
                @Index(name = "idx_kc_mastery_user", columnList = "userId"),
                @Index(name = "idx_kc_mastery_kc", columnList = "kcId"),
                @Index(name = "idx_kc_mastery_user_p_learned", columnList = "userId,pLearned")
        }
)
public class KcMasteryState extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long kcId;

    @Column(nullable = false)
    private double pLearned = 0.1;

    @Column(nullable = false)
    private int consecutiveCorrect = 0;

    @Column(nullable = false)
    private int consecutiveIncorrect = 0;

    @Column(nullable = false)
    private int totalResponses = 0;

    @Column(nullable = false)
    private int correctResponses = 0;

    private Instant lastResponseAt;

    private Instant masteredAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getKcId() {
        return kcId;
    }

    public void setKcId(Long kcId) {
        this.kcId = kcId;
    }

    public double getPLearned() {
        return pLearned;
    }

    public void setPLearned(double pLearned) {
        this.pLearned = pLearned;
    }

    public int getConsecutiveCorrect() {
        return consecutiveCorrect;
    }

    public void setConsecutiveCorrect(int consecutiveCorrect) {
        this.consecutiveCorrect = consecutiveCorrect;
    }

    public int getConsecutiveIncorrect() {
        return consecutiveIncorrect;
    }

    public void setConsecutiveIncorrect(int consecutiveIncorrect) {
        this.consecutiveIncorrect = consecutiveIncorrect;
    }

    public int getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(int totalResponses) {
        this.totalResponses = totalResponses;
    }

    public int getCorrectResponses() {
        return correctResponses;
    }

    public void setCorrectResponses(int correctResponses) {
        this.correctResponses = correctResponses;
    }

    public Instant getLastResponseAt() {
        return lastResponseAt;
    }

    public void setLastResponseAt(Instant lastResponseAt) {
        this.lastResponseAt = lastResponseAt;
    }

    public Instant getMasteredAt() {
        return masteredAt;
    }

    public void setMasteredAt(Instant masteredAt) {
        this.masteredAt = masteredAt;
    }
}
