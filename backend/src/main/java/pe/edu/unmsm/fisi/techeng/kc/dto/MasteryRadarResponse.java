package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.time.Instant;
import java.util.List;

public record MasteryRadarResponse(
        Long userId,
        List<KcMasteryEntry> kcs,
        long masteredCount,
        long totalKcs,
        Instant lastUpdate
) {
}
