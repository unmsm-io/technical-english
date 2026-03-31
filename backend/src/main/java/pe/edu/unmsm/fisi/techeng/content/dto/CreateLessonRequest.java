package pe.edu.unmsm.fisi.techeng.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.edu.unmsm.fisi.techeng.content.entity.LessonType;

public record CreateLessonRequest(
        @NotNull Long moduleId,
        @NotBlank @Size(max = 200) String title,
        String content,
        @NotNull Integer displayOrder,
        Integer estimatedMinutes,
        LessonType type
) {}
