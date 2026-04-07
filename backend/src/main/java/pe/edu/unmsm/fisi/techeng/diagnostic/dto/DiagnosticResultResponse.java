package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import java.time.LocalDateTime;
import java.util.Map;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record DiagnosticResultResponse(
        Long attemptId,
        Long userId,
        CefrLevel placedLevel,
        CefrLevel placedLevelLegacy,
        int correctCount,
        int totalItems,
        Map<String, Integer> perLevelBreakdown,
        Map<String, Integer> perSkillBreakdown,
        Integer vocabularySize,
        Double abilityTheta,
        Double abilityStandardError,
        CefrLevel predictedCefr,
        LocalDateTime completedAt
) {}
