package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.util.List;

public record CohortMasteryResponse(
        long userCount,
        List<KcDistribution> distributions
) {

    public record KcDistribution(
            Long kcId,
            String kcName,
            String kcNameEs,
            long lowCount,
            long mediumCount,
            long highCount,
            long masteredCount
    ) {
    }
}
