package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.util.List;

public record AcquisitionRateResponse(
        Long userId,
        List<WeekPoint> points
) {

    public record WeekPoint(
            String week,
            long count
    ) {
    }
}
