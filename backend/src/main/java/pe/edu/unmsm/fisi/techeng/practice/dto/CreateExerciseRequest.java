package pe.edu.unmsm.fisi.techeng.practice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.unmsm.fisi.techeng.practice.entity.Difficulty;
import pe.edu.unmsm.fisi.techeng.practice.entity.ExerciseType;

public record CreateExerciseRequest(
        Long lessonId,
        @NotBlank String question,
        @NotNull ExerciseType type,
        String options,
        @NotBlank String correctAnswer,
        String explanation,
        Difficulty difficulty
) {}
