package pe.edu.unmsm.fisi.techeng.summative.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.summative.dto.SummativeDtos;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;

@Component
public class SummativeMapper {

    public SummativeDtos.SummativeTestResponse toTestResponse(
            SummativeTest test,
            int comprehensionQuestionCount
    ) {
        return new SummativeDtos.SummativeTestResponse(
                test.getId(),
                test.getTaskType(),
                test.getCefrLevel(),
                test.getTitleEs(),
                test.getDescriptionEs(),
                test.getReadingSpecEn(),
                test.getReadingContextEs(),
                test.getProductionInstructionEs(),
                comprehensionQuestionCount
        );
    }

    public SummativeDtos.SummativeTestDetailResponse toTestDetailResponse(
            SummativeTest test,
            List<SummativeDtos.SummativeQuestionReviewResponse> comprehensionQuestions
    ) {
        return new SummativeDtos.SummativeTestDetailResponse(
                test.getId(),
                test.getTaskType(),
                test.getCefrLevel(),
                test.getTitleEs(),
                test.getDescriptionEs(),
                test.getReadingSpecEn(),
                test.getReadingContextEs(),
                test.getProductionInstructionEs(),
                test.getProductionExpectedAnswerEn(),
                comprehensionQuestions,
                test.getPassingScore(),
                test.getActive()
        );
    }

    public SummativeDtos.SummativeAttemptResponse toAttemptResponse(
            SummativeAttempt attempt,
            TaskFeedbackPayload productionFeedbackPayload,
            List<SummativeDtos.SummativeComprehensionResponseItem> comprehensionResponses
    ) {
        return new SummativeDtos.SummativeAttemptResponse(
                attempt.getId(),
                attempt.getSummativeTestId(),
                attempt.getUserId(),
                attempt.getCurrentPhase(),
                attempt.getProductionAnswerEn(),
                attempt.getProductionScore(),
                productionFeedbackPayload,
                comprehensionResponses,
                attempt.getComprehensionScore(),
                attempt.getOverallScore(),
                attempt.getPassed(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getCompletedAt()
        );
    }

    public SummativeDtos.SummativeAttemptHistoryResponse toHistoryResponse(
            SummativeAttempt attempt,
            SummativeTest test
    ) {
        return new SummativeDtos.SummativeAttemptHistoryResponse(
                attempt.getId(),
                test.getId(),
                test.getTitleEs(),
                test.getTaskType(),
                attempt.getOverallScore(),
                attempt.getPassed(),
                attempt.getCompletedAt()
        );
    }

    public SummativeDtos.SummativeResultResponse toResultResponse(
            SummativeAttempt attempt,
            SummativeTest test,
            TaskFeedbackPayload productionFeedbackPayload,
            List<SummativeDtos.SummativeQuestionReviewResponse> comprehensionReview
    ) {
        return new SummativeDtos.SummativeResultResponse(
                attempt.getId(),
                test.getId(),
                test.getTitleEs(),
                test.getTaskType(),
                attempt.getProductionScore(),
                attempt.getProductionAnswerEn(),
                productionFeedbackPayload,
                attempt.getComprehensionScore(),
                attempt.getOverallScore(),
                attempt.getPassed(),
                comprehensionReview,
                attempt.getCompletedAt()
        );
    }
}
