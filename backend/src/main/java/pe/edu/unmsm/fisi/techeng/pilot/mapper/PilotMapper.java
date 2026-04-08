package pe.edu.unmsm.fisi.techeng.pilot.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.pilot.dto.PilotDtos;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotCohort;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotEnrollment;

@Component
public class PilotMapper {

    public PilotDtos.PilotCohortResponse toCohortResponse(PilotCohort cohort) {
        return new PilotDtos.PilotCohortResponse(
                cohort.getId(),
                cohort.getName(),
                cohort.getDescription(),
                cohort.getState().name(),
                cohort.getTargetUserCount(),
                cohort.getEnrolledUserCount(),
                cohort.getEnrollmentStartedAt(),
                cohort.getInterventionStartedAt(),
                cohort.getPostTestStartedAt(),
                cohort.getCompletedAt(),
                cohort.getCreatedBy()
        );
    }

    public PilotDtos.PilotEnrollmentResponse toEnrollmentResponse(
            PilotEnrollment enrollment,
            List<Long> preSummatives,
            List<Long> postSummatives
    ) {
        return new PilotDtos.PilotEnrollmentResponse(
                enrollment.getId(),
                enrollment.getCohortId(),
                enrollment.getUserId(),
                enrollment.getEnrolledAt(),
                enrollment.getPreTestDiagnosticAttemptId(),
                preSummatives,
                enrollment.getPostTestDiagnosticAttemptId(),
                postSummatives,
                enrollment.getFirstActionAt(),
                enrollment.getLastActionAt(),
                enrollment.getActionsCount()
        );
    }
}
