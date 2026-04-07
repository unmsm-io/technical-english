package pe.edu.unmsm.fisi.techeng.task.dto;

import java.util.Map;

public record TaskStatsResponse(
        Map<String, Long> byType,
        Map<String, Long> byLevel,
        long totalTasks,
        long totalAttempts
) {}
