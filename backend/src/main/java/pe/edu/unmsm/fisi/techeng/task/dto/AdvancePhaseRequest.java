package pe.edu.unmsm.fisi.techeng.task.dto;

import jakarta.validation.constraints.NotNull;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;

public record AdvancePhaseRequest(
        @NotNull TaskPhase phase
) {}
