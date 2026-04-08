package pe.edu.unmsm.fisi.techeng.kc.dto;

import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record KnowledgeComponentResponse(
        Long id,
        String name,
        String nameEs,
        String description,
        KcCategory category,
        CefrLevel cefrLevel,
        double pInitialLearned,
        double pTransition,
        double pGuess,
        double pSlip,
        boolean active
) {
}
