package pe.edu.unmsm.fisi.techeng.task.dto;

import java.util.List;

public record TaskFeedbackPayload(
        int correctness,
        List<String> strengths,
        List<TaskFeedbackError> errors,
        String improvedAnswer,
        String languageFocusComments
) {
    public record TaskFeedbackError(
            String original,
            String fix,
            String rule
    ) {}
}
