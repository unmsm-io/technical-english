package pe.edu.unmsm.fisi.techeng.verification.dto;

import java.time.LocalDateTime;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;

public record GeneratedItemResponse(
        Long id,
        GeneratedItemState state,
        CefrLevel targetCefrLevel,
        DiagnosticSkill targetSkill,
        BloomLevel bloomLevel,
        String topicHint,
        String questionText,
        List<String> options,
        Integer correctAnswerIdx,
        String explanation,
        Double solvabilityScore,
        Double factualScore,
        Double reasoningScore,
        Boolean tokenPreservationOk,
        Double overallScore,
        String rejectionReason,
        Long promotedToDiagnosticItemId,
        LocalDateTime createdAt
) {
}
