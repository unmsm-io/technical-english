package pe.edu.unmsm.fisi.techeng.summative.dto;

import java.time.LocalDateTime;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativePhase;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public final class SummativeDtos {

    private SummativeDtos() {}

    public record SummativeQuestionResponse(
            String question,
            List<String> options
    ) {}

    public record SummativeQuestionReviewResponse(
            String question,
            List<String> options,
            Integer selectedAnswerIdx,
            Integer correctAnswerIdx,
            boolean correct,
            String explanation
    ) {}

    public record SummativeComprehensionResponseItem(
            Integer questionIdx,
            Integer answerIdx,
            boolean correct
    ) {}

    public record SummativeTestResponse(
            Long id,
            TaskType taskType,
            CefrLevel cefrLevel,
            String titleEs,
            String descriptionEs,
            String readingSpecEn,
            String readingContextEs,
            String productionInstructionEs,
            Integer comprehensionQuestionCount
    ) {}

    public record SummativeTestDetailResponse(
            Long id,
            TaskType taskType,
            CefrLevel cefrLevel,
            String titleEs,
            String descriptionEs,
            String readingSpecEn,
            String readingContextEs,
            String productionInstructionEs,
            String productionExpectedAnswerEn,
            List<SummativeQuestionReviewResponse> comprehensionQuestions,
            Integer passingScore,
            Boolean active
    ) {}

    public record SummativeAttemptResponse(
            Long id,
            Long testId,
            Long userId,
            SummativePhase currentPhase,
            String productionAnswerEn,
            Integer productionScore,
            TaskFeedbackPayload productionFeedbackPayload,
            List<SummativeComprehensionResponseItem> comprehensionResponses,
            Integer comprehensionScore,
            Integer overallScore,
            Boolean passed,
            LocalDateTime startedAt,
            LocalDateTime submittedAt,
            LocalDateTime completedAt
    ) {}

    public record SummativeAttemptHistoryResponse(
            Long id,
            Long testId,
            String testTitleEs,
            TaskType taskType,
            Integer overallScore,
            Boolean passed,
            LocalDateTime completedAt
    ) {}

    public record SummativeResultResponse(
            Long attemptId,
            Long testId,
            String titleEs,
            TaskType taskType,
            Integer productionScore,
            String productionAnswerEn,
            TaskFeedbackPayload productionFeedbackPayload,
            Integer comprehensionScore,
            Integer overallScore,
            Boolean passed,
            List<SummativeQuestionReviewResponse> comprehensionReview,
            LocalDateTime completedAt
    ) {}

    public record AdvancePhaseRequest(
            SummativePhase phase
    ) {}

    public record SubmitProductionRequest(
            String answerEn
    ) {}

    public record SubmitComprehensionRequest(
            List<Integer> answerIdxs
    ) {}
}
