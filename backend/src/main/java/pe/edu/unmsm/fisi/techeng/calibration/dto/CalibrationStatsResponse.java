package pe.edu.unmsm.fisi.techeng.calibration.dto;

import java.time.Instant;
import java.util.Map;

public record CalibrationStatsResponse(
        long totalItems,
        Map<CalibrationStatus, Long> byStatus,
        Double avgDifficulty,
        Double avgDiscrimination,
        Double avgAbilityTheta,
        Instant lastCalibrationAt,
        long totalResponses
) {
}
