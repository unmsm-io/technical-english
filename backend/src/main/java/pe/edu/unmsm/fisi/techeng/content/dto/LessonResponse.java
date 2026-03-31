package pe.edu.unmsm.fisi.techeng.content.dto;

import pe.edu.unmsm.fisi.techeng.content.entity.LessonType;
import java.time.LocalDateTime;
import java.util.List;

public record LessonResponse(
        Long id,
        Long moduleId,
        String title,
        String content,
        Integer displayOrder,
        Integer estimatedMinutes,
        LessonType type,
        Boolean active,
        List<ResourceResponse> resources,
        LocalDateTime createdAt
) {}
