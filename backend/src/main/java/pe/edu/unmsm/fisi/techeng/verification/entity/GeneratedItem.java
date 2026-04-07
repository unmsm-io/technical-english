package pe.edu.unmsm.fisi.techeng.verification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@Entity
@Table(name = "generated_items", indexes = {
        @Index(name = "idx_generated_items_state", columnList = "state"),
        @Index(name = "idx_generated_items_requested_by", columnList = "requestedBy")
})
@Getter
@Setter
public class GeneratedItem extends BaseEntity {

    @Column(nullable = false)
    private Long requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CefrLevel targetCefrLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiagnosticSkill targetSkill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BloomLevel bloomLevel;

    @Column(length = 300)
    private String topicHint;

    @Column(columnDefinition = "TEXT")
    private String questionTextEn;

    @Column(columnDefinition = "TEXT")
    private String optionsJson;

    private Integer correctAnswerIdx;

    @Column(columnDefinition = "TEXT")
    private String explanationEn;

    @Column(columnDefinition = "TEXT")
    private String protectedTokensInQuestion;

    private Double solvabilityScore;

    @Column(columnDefinition = "TEXT")
    private String solvabilityNotes;

    private Double factualScore;

    @Column(columnDefinition = "TEXT")
    private String factualNotes;

    private Double reasoningScore;

    @Column(columnDefinition = "TEXT")
    private String reasoningNotes;

    private Boolean tokenPreservationOk;

    @Column(columnDefinition = "TEXT")
    private String tokenPreservationNotes;

    private Double overallScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GeneratedItemState state = GeneratedItemState.PENDING_GENERATION;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private Long approvedBy;

    private java.time.Instant approvedAt;

    private Long promotedToDiagnosticItemId;
}
