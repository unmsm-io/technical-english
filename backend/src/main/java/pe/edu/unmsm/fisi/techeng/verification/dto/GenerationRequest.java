package pe.edu.unmsm.fisi.techeng.verification.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;

public record GenerationRequest(
        @NotNull Long requestedBy,
        @NotNull CefrLevel targetCefrLevel,
        @NotNull DiagnosticSkill targetSkill,
        @NotNull BloomLevel bloomLevel,
        @Size(max = 300) String topicHint
) {
}
