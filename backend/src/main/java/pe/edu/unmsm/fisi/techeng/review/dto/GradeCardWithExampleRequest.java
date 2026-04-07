package pe.edu.unmsm.fisi.techeng.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;

public record GradeCardWithExampleRequest(
        @NotNull ReviewGrade grade,
        @NotBlank String exampleSentence
) {}
