package pe.edu.unmsm.fisi.techeng.content.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ModuleResponse(
        Long id,
        String title,
        String description,
        Integer displayOrder,
        String level,
        Boolean active,
        int lessonCount,
        LocalDateTime createdAt
) {}
