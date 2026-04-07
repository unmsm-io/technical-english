package pe.edu.unmsm.fisi.techeng.task.dto;

import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public record TaskFeedbackResponse(
        Long attemptId,
        Long taskId,
        TaskType taskType,
        Integer score,
        String userAnswerEn,
        String expectedAnswerEn,
        String postTaskExplanationEs,
        TaskFeedbackPayload llmFeedbackPayload,
        String languageFocusComments,
        String improvedAnswer
) {}
