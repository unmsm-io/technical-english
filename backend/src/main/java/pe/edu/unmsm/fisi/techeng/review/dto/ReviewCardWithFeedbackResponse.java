package pe.edu.unmsm.fisi.techeng.review.dto;

public record ReviewCardWithFeedbackResponse(
        ReviewCardResponse card,
        ReviewFeedbackPayload feedback
) {}
