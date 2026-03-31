package pe.edu.unmsm.fisi.techeng.llm.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import pe.edu.unmsm.fisi.techeng.practice.entity.Difficulty;
import pe.edu.unmsm.fisi.techeng.practice.entity.ExerciseType;

public record GenerateExercisesRequest(
        @NotNull Long lessonId,
        ExerciseType type,
        Difficulty difficulty,
        @Min(1) @Max(10) Integer count
) {
    public GenerateExercisesRequest {
        if (count == null) count = 5;
        if (difficulty == null) difficulty = Difficulty.BEGINNER;
        if (type == null) type = ExerciseType.MULTIPLE_CHOICE;
    }
}
