package pe.edu.unmsm.fisi.techeng.calibration.dto;

import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record UserAbilityResponse(
        Long userId,
        Double theta,
        Double standardError,
        Instant lastUpdate,
        CefrLevel predictedCefr,
        CefrLevel placedLevelLegacy
) {
}
