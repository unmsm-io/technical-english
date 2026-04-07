package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record DiagnosticAttemptHistoryResponse(
        Long attemptId,
        Long userId,
        CefrLevel placedLevel,
        Integer correctCount,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {}
