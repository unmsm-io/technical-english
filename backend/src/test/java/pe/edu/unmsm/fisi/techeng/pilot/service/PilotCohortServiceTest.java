package pe.edu.unmsm.fisi.techeng.pilot.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.pilot.dto.PilotDtos;
import pe.edu.unmsm.fisi.techeng.pilot.entity.CohortState;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotCohort;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotEnrollment;
import pe.edu.unmsm.fisi.techeng.pilot.mapper.PilotMapper;
import pe.edu.unmsm.fisi.techeng.pilot.repository.PilotCohortRepository;
import pe.edu.unmsm.fisi.techeng.pilot.repository.PilotEnrollmentRepository;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeTestRepository;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

class PilotCohortServiceTest {

    private PilotCohortRepository pilotCohortRepository;
    private PilotEnrollmentRepository pilotEnrollmentRepository;
    private DiagnosticAttemptRepository diagnosticAttemptRepository;
    private SummativeTestRepository summativeTestRepository;
    private SummativeAttemptRepository summativeAttemptRepository;
    private TaskAttemptRepository taskAttemptRepository;
    private UserRepository userRepository;
    private PilotCohortService service;

    @BeforeEach
    void setUp() {
        pilotCohortRepository = mock(PilotCohortRepository.class);
        pilotEnrollmentRepository = mock(PilotEnrollmentRepository.class);
        diagnosticAttemptRepository = mock(DiagnosticAttemptRepository.class);
        summativeTestRepository = mock(SummativeTestRepository.class);
        summativeAttemptRepository = mock(SummativeAttemptRepository.class);
        taskAttemptRepository = mock(TaskAttemptRepository.class);
        userRepository = mock(UserRepository.class);
        service = new PilotCohortService(
                pilotCohortRepository,
                pilotEnrollmentRepository,
                diagnosticAttemptRepository,
                summativeTestRepository,
                summativeAttemptRepository,
                taskAttemptRepository,
                userRepository,
                new CohenDCalculator(),
                new PilotMapper(),
                new ObjectMapper()
        );
    }

    @Test
    void createShouldPersistCohort() {
        User admin = new User();
        admin.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(pilotCohortRepository.save(any(PilotCohort.class))).thenAnswer(invocation -> {
            PilotCohort cohort = invocation.getArgument(0);
            cohort.setId(11L);
            return cohort;
        });

        PilotDtos.PilotCohortResponse response = service.create(
                new PilotDtos.CreateCohortRequest("Grupo A", "Piloto local", 10, 1L)
        );

        assertThat(response.id()).isEqualTo(11L);
        assertThat(response.state()).isEqualTo("ENROLLING");
    }

    @Test
    void recordActionShouldUpdateEnrollmentCounters() {
        PilotCohort cohort = new PilotCohort();
        cohort.setId(3L);
        cohort.setState(CohortState.INTERVENTION_PHASE);
        when(pilotCohortRepository.findById(3L)).thenReturn(Optional.of(cohort));

        PilotEnrollment enrollment = new PilotEnrollment();
        enrollment.setId(7L);
        enrollment.setCohortId(3L);
        enrollment.setUserId(9L);
        enrollment.setEnrolledAt(Instant.now());
        enrollment.setActionsCount(0);
        when(pilotEnrollmentRepository.findByUserId(9L)).thenReturn(List.of(enrollment));
        when(pilotEnrollmentRepository.save(any(PilotEnrollment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.recordAction(9L);

        assertThat(enrollment.getActionsCount()).isEqualTo(1);
        assertThat(enrollment.getFirstActionAt()).isNotNull();
        assertThat(enrollment.getLastActionAt()).isNotNull();
    }
}
