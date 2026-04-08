package pe.edu.unmsm.fisi.techeng.task.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitRewriteRequest(
        @NotBlank String rewriteAnswerEn
) {}
