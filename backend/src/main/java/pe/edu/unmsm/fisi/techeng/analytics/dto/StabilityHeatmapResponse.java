package pe.edu.unmsm.fisi.techeng.analytics.dto;

import java.util.List;

public record StabilityHeatmapResponse(
        Long userId,
        List<Bucket> buckets
) {

    public record Bucket(
            String label,
            long count
    ) {
    }
}
