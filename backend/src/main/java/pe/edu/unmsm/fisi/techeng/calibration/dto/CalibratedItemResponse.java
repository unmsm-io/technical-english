package pe.edu.unmsm.fisi.techeng.calibration.dto;

import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record CalibratedItemResponse(
        Long id,
        String questionPreview,
        CefrLevel cefrLevel,
        Double difficulty,
        Double discrimination,
        Integer responseCount,
        CalibrationStatus status
) {
}
