package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;

public record KcMasteryEntry(
        Long kcId,
        String kcName,
        String kcNameEs,
        KcCategory category,
        double pLearned,
        int totalResponses,
        int correctResponses,
        Instant masteredAt
) {
}
