package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.util.List;

public record KcExtractionResult(
        int kcsCreated,
        int mappingsCreated,
        long durationMs,
        List<String> rejectedItems
) {
}
