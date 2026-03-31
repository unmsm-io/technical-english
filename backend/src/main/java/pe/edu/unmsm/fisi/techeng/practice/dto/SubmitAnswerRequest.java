package pe.edu.unmsm.fisi.techeng.practice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitAnswerRequest(
        @NotNull Long userId,
        @NotNull Long exerciseId,
        @NotBlank String answer
) {}
