package pe.edu.unmsm.fisi.techeng.calibration.dto;

import java.time.Instant;

public record CalibrationRunResponse(
        int itemsCalibrated,
        int itemsConverged,
        long durationMs,
        Instant timestamp
) {
}
