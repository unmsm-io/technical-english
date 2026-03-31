package pe.edu.unmsm.fisi.techeng.llm.dto;

import pe.edu.unmsm.fisi.techeng.practice.entity.Difficulty;
import pe.edu.unmsm.fisi.techeng.practice.entity.ExerciseType;

public record GeneratedExercise(
        String question,
        ExerciseType type,
        String options,
        String correctAnswer,
        String explanation,
        Difficulty difficulty
) {}
