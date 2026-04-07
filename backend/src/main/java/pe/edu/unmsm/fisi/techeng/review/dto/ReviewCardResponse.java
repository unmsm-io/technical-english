package pe.edu.unmsm.fisi.techeng.review.dto;

import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;

public record ReviewCardResponse(
        Long id,
        VocabularyResponse vocabularyItem,
        double stability,
        double difficulty,
        int elapsedDays,
        int scheduledDays,
        int reps,
        int lapses,
        CardState state,
        Instant lastReview,
        Instant due,
        RetentionTier retentionTier
) {}
