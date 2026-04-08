package pe.edu.unmsm.fisi.techeng.pilot.dto;

import java.time.Instant;
import java.util.List;

public final class PilotDtos {

    private PilotDtos() {}

    public record CreateCohortRequest(
            String name,
            String description,
            Integer targetUserCount,
            Long createdBy
    ) {}

    public record AdvanceCohortRequest(
            String state
    ) {}

    public record PilotCohortResponse(
            Long id,
            String name,
            String description,
            String state,
            Integer targetUserCount,
            Integer enrolledUserCount,
            Instant enrollmentStartedAt,
            Instant interventionStartedAt,
            Instant postTestStartedAt,
            Instant completedAt,
            Long createdBy
    ) {}

    public record PilotEnrollmentResponse(
            Long id,
            Long cohortId,
            Long userId,
            Instant enrolledAt,
            Long preTestDiagnosticAttemptId,
            List<Long> preTestSummativeAttemptIds,
            Long postTestDiagnosticAttemptId,
            List<Long> postTestSummativeAttemptIds,
            Instant firstActionAt,
            Instant lastActionAt,
            Integer actionsCount
    ) {}

    public record PilotMetricEntry(
            Double vocabularySizeDelta,
            Double vocabularyCohenD,
            Double comprehensionScoreDelta,
            Double comprehensionCohenD,
            Double rewriteAcceptanceRate,
            Double avgTimeToFirstActionMinutes,
            Double return7dRate,
            Double summativePassRate
    ) {}

    public record PilotUserResult(
            Long userId,
            Double vocabularySizeDelta,
            Double comprehensionScoreDelta,
            Double rewriteAcceptanceRate,
            Double timeToFirstActionMinutes,
            Boolean returnedWithin7Days,
            Double postSummativePassRate
    ) {}

    public record PilotResultsResponse(
            Long cohortId,
            String cohortName,
            Integer enrolledCount,
            Integer completedCount,
            PilotMetricEntry metrics,
            List<PilotUserResult> perUserBreakdown
    ) {}
}
