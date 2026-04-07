package pe.edu.unmsm.fisi.techeng.task.dto;

import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public record TaskResponse(
        Long id,
        TaskType taskType,
        CefrLevel cefrLevel,
        String titleEs,
        String descriptionEs
) {}
