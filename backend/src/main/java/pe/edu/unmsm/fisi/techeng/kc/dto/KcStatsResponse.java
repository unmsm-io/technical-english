package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.util.Map;

public record KcStatsResponse(
        long totalKcs,
        Map<String, Long> byCategory,
        Map<String, Long> byCefr
) {
}
