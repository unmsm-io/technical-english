package pe.edu.unmsm.fisi.techeng.practice.dto;

import pe.edu.unmsm.fisi.techeng.practice.entity.Difficulty;
import pe.edu.unmsm.fisi.techeng.practice.entity.ExerciseType;
import java.time.LocalDateTime;

public record ExerciseResponse(
        Long id,
        Long lessonId,
        String question,
        ExerciseType type,
        String options,
        Difficulty difficulty,
        Boolean llmGenerated,
        LocalDateTime createdAt
) {}
