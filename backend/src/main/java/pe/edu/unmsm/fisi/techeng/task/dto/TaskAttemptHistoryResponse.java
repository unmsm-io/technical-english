package pe.edu.unmsm.fisi.techeng.task.dto;

import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public record TaskAttemptHistoryResponse(
        Long id,
        Long taskId,
        String taskTitleEs,
        TaskType taskType,
        Integer score,
        LocalDateTime completedAt
) {}
