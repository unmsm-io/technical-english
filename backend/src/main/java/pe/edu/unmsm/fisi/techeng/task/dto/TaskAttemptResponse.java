package pe.edu.unmsm.fisi.techeng.task.dto;

import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;

public record TaskAttemptResponse(
        Long id,
        Long taskId,
        Long userId,
        TaskPhase phase,
        String userAnswerEn,
        TaskFeedbackPayload llmFeedbackPayload,
        String llmFeedbackCefr,
        Integer score,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        LocalDateTime completedAt
) {}
