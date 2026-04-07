package pe.edu.unmsm.fisi.techeng.review.dto;

import jakarta.validation.constraints.NotNull;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;

public record GradeCardRequest(
        @NotNull ReviewGrade grade
) {}
