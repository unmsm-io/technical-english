package pe.edu.unmsm.fisi.techeng.kc.entity;

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
        name = "kc_response_logs",
        indexes = {
                @Index(name = "idx_kc_response_logs_user_kc_responded", columnList = "userId,kcId,respondedAt"),
                @Index(name = "idx_kc_response_logs_kc_responded", columnList = "kcId,respondedAt"),
                @Index(name = "idx_kc_response_logs_user_responded", columnList = "userId,respondedAt")
        }
)
public class KcResponseLog extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long kcId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KcItemType itemType;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private boolean correct;

    @Column(nullable = false)
    private double pLearnedBefore;

    @Column(nullable = false)
    private double pLearnedAfter;

    @Column(nullable = false)
    private Instant respondedAt;

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

    public KcItemType getItemType() {
        return itemType;
    }

    public void setItemType(KcItemType itemType) {
        this.itemType = itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public double getPLearnedBefore() {
        return pLearnedBefore;
    }

    public void setPLearnedBefore(double pLearnedBefore) {
        this.pLearnedBefore = pLearnedBefore;
    }

    public double getPLearnedAfter() {
        return pLearnedAfter;
    }

    public void setPLearnedAfter(double pLearnedAfter) {
        this.pLearnedAfter = pLearnedAfter;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }
}
