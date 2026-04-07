package pe.edu.unmsm.fisi.techeng.review.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardState;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;

@Component
public class ReviewMapper {

    public ReviewCardResponse toResponse(ReviewCard card, VocabularyResponse vocabularyItem) {
        return new ReviewCardResponse(
                card.getId(),
                vocabularyItem,
                card.getStability(),
                card.getDifficulty(),
                card.getElapsedDays(),
                card.getScheduledDays(),
                card.getReps(),
                card.getLapses(),
                card.getState(),
                card.getLastReview(),
                card.getDue(),
                card.getRetentionTier()
        );
    }

    public ReviewCardState toState(ReviewCard card, java.time.Instant reviewTime, int elapsedDays) {
        return new ReviewCardState(
                card.getStability(),
                card.getDifficulty(),
                elapsedDays,
                card.getScheduledDays(),
                card.getReps(),
                card.getLapses(),
                card.getState(),
                card.getLastReview(),
                reviewTime
        );
    }
}
