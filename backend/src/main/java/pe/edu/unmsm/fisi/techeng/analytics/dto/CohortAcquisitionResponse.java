package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.util.List;

public record CohortAcquisitionResponse(
        long userCount,
        List<WeekAggregate> points
) {

    public record WeekAggregate(
            String week,
            double averageCount,
            long totalCount
    ) {
    }
}
