package pe.edu.unmsm.fisi.techeng.review.dto;

import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record ReviewBootstrapResponse(
        int cardsCreated,
        CefrLevel level,
        long durationMs
) {}
