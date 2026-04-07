package pe.edu.unmsm.fisi.techeng.review.dto;

import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;

public record ReviewCardState(
        double stability,
        double difficulty,
        int elapsedDays,
        int scheduledDays,
        int reps,
        int lapses,
        CardState state,
        Instant lastReview,
        Instant due
) {}
