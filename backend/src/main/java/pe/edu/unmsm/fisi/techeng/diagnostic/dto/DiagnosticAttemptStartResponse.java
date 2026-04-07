package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DiagnosticAttemptStartResponse(
        Long attemptId,
        Long userId,
        LocalDateTime startedAt,
        List<DiagnosticItemResponse> items
) {}
