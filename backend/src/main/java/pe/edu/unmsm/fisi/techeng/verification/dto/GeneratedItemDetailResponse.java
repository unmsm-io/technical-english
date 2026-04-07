package pe.edu.unmsm.fisi.techeng.verification.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;

public record GeneratedItemDetailResponse(
        Long id,
        Long requestedBy,
        GeneratedItemState state,
        CefrLevel targetCefrLevel,
        DiagnosticSkill targetSkill,
        BloomLevel bloomLevel,
        String topicHint,
        String questionText,
        List<String> options,
        Integer correctAnswerIdx,
        String explanation,
        List<String> protectedTokens,
        Double solvabilityScore,
        String solvabilityNotes,
        Double factualScore,
        String factualNotes,
        Double reasoningScore,
        String reasoningNotes,
        Boolean tokenPreservationOk,
        String tokenPreservationNotes,
        Double overallScore,
        String rejectionReason,
        Long approvedBy,
        Instant approvedAt,
        Long promotedToDiagnosticItemId,
        List<VerificationLogEntry> verificationLogs,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
