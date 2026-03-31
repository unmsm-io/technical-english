package pe.edu.unmsm.fisi.techeng.practice.dto;

import java.time.LocalDateTime;

public record AttemptResponse(
        Long id,
        Long userId,
        Long exerciseId,
        String userAnswer,
        String correctAnswer,
        Boolean correct,
        Double score,
        String feedback,
        String explanation,
        LocalDateTime completedAt
) {}
