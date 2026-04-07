package pe.edu.unmsm.fisi.techeng.review.dto;

public record ReviewFeedbackPayload(
        String comment,
        String correctedSentence,
        boolean isCorrect
) {}
