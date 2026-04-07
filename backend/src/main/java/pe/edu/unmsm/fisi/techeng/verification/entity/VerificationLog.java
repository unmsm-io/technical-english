package pe.edu.unmsm.fisi.techeng.verification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(name = "verification_logs", indexes = {
        @Index(name = "idx_verification_logs_item", columnList = "generatedItemId")
})
@Getter
@Setter
public class VerificationLog extends BaseEntity {

    @Column(nullable = false)
    private Long generatedItemId;

    @Column(nullable = false, length = 50)
    private String agentName;

    private Long latencyMs;

    private Integer tokensUsed;

    @Column(length = 30)
    private String verdict;

    @Column(columnDefinition = "TEXT")
    private String rawResponseJson;
}
