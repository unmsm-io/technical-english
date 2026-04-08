package pe.edu.unmsm.fisi.techeng.pilot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.pilot.dto.PilotDtos;
import pe.edu.unmsm.fisi.techeng.pilot.entity.CohortState;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotCohort;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotEnrollment;
import pe.edu.unmsm.fisi.techeng.pilot.mapper.PilotMapper;
import pe.edu.unmsm.fisi.techeng.pilot.repository.PilotCohortRepository;
import pe.edu.unmsm.fisi.techeng.pilot.repository.PilotEnrollmentRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativePhase;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeTestRepository;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PilotCohortService {

    private final PilotCohortRepository pilotCohortRepository;
    private final PilotEnrollmentRepository pilotEnrollmentRepository;
    private final DiagnosticAttemptRepository diagnosticAttemptRepository;
    private final SummativeTestRepository summativeTestRepository;
    private final SummativeAttemptRepository summativeAttemptRepository;
    private final TaskAttemptRepository taskAttemptRepository;
    private final UserRepository userRepository;
    private final CohenDCalculator cohenDCalculator;
    private final PilotMapper pilotMapper;
    private final ObjectMapper objectMapper;

    public PilotDtos.PilotCohortResponse create(PilotDtos.CreateCohortRequest request) {
        userRepository.findById(request.createdBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.createdBy()));

        PilotCohort cohort = new PilotCohort();
        cohort.setName(request.name());
        cohort.setDescription(request.description());
        cohort.setTargetUserCount(request.targetUserCount());
        cohort.setCreatedBy(request.createdBy());
        cohort.setEnrollmentStartedAt(Instant.now());
        return pilotMapper.toCohortResponse(pilotCohortRepository.save(cohort));
    }

    @Transactional(readOnly = true)
    public List<PilotDtos.PilotCohortResponse> list() {
        return pilotCohortRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(pilotMapper::toCohortResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PilotDtos.PilotCohortResponse getById(Long cohortId) {
        return pilotMapper.toCohortResponse(getCohort(cohortId));
    }

    public PilotDtos.PilotEnrollmentResponse enrollUser(Long cohortId, Long userId) {
        PilotCohort cohort = getCohort(cohortId);
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (cohort.getState() != CohortState.ENROLLING && cohort.getState() != CohortState.PRE_TEST_PHASE) {
            throw new BusinessRuleException("La cohorte ya no acepta nuevos enrollments");
        }
        if (pilotEnrollmentRepository.findByCohortIdAndUserId(cohortId, userId).isPresent()) {
            throw new BusinessRuleException("El usuario ya está inscrito en esta cohorte");
        }

        PilotEnrollment enrollment = new PilotEnrollment();
        enrollment.setCohortId(cohortId);
        enrollment.setUserId(userId);
        enrollment.setEnrolledAt(Instant.now());
        DiagnosticAttempt preDiagnostic = createDiagnosticAttempt(userId);
        enrollment.setPreTestDiagnosticAttemptId(preDiagnostic.getId());
        enrollment.setPreTestSummativeAttemptIds(writeIds(createSummativeAttempts(userId)));
        PilotEnrollment saved = pilotEnrollmentRepository.save(enrollment);

        cohort.setEnrolledUserCount(pilotEnrollmentRepository.findByCohortIdOrderByEnrolledAtAsc(cohortId).size());
        if (cohort.getState() == CohortState.ENROLLING) {
            cohort.setState(CohortState.PRE_TEST_PHASE);
        }
        pilotCohortRepository.save(cohort);

        return pilotMapper.toEnrollmentResponse(saved, readIds(saved.getPreTestSummativeAttemptIds()), readIds(saved.getPostTestSummativeAttemptIds()));
    }

    public PilotDtos.PilotCohortResponse advancePhase(Long cohortId, CohortState nextState) {
        PilotCohort cohort = getCohort(cohortId);
        CohortState expected = switch (cohort.getState()) {
            case ENROLLING -> CohortState.PRE_TEST_PHASE;
            case PRE_TEST_PHASE -> CohortState.INTERVENTION_PHASE;
            case INTERVENTION_PHASE -> CohortState.POST_TEST_PHASE;
            case POST_TEST_PHASE -> CohortState.RESULTS_AVAILABLE;
            case RESULTS_AVAILABLE -> CohortState.ARCHIVED;
            case ARCHIVED -> throw new BusinessRuleException("La cohorte ya fue archivada");
        };
        if (expected != nextState) {
            throw new BusinessRuleException("Transición de cohorte inválida");
        }
        cohort.setState(nextState);
        if (nextState == CohortState.INTERVENTION_PHASE) {
            cohort.setInterventionStartedAt(Instant.now());
        } else if (nextState == CohortState.POST_TEST_PHASE) {
            cohort.setPostTestStartedAt(Instant.now());
        } else if (nextState == CohortState.RESULTS_AVAILABLE || nextState == CohortState.ARCHIVED) {
            cohort.setCompletedAt(Instant.now());
        }
        return pilotMapper.toCohortResponse(pilotCohortRepository.save(cohort));
    }

    public PilotDtos.PilotCohortResponse triggerPostTest(Long cohortId) {
        PilotCohort cohort = getCohort(cohortId);
        cohort.setState(CohortState.POST_TEST_PHASE);
        cohort.setPostTestStartedAt(Instant.now());
        for (PilotEnrollment enrollment : pilotEnrollmentRepository.findByCohortIdOrderByEnrolledAtAsc(cohortId)) {
            DiagnosticAttempt postDiagnostic = createDiagnosticAttempt(enrollment.getUserId());
            enrollment.setPostTestDiagnosticAttemptId(postDiagnostic.getId());
            enrollment.setPostTestSummativeAttemptIds(writeIds(createSummativeAttempts(enrollment.getUserId())));
            pilotEnrollmentRepository.save(enrollment);
        }
        return pilotMapper.toCohortResponse(pilotCohortRepository.save(cohort));
    }

    @Transactional(readOnly = true)
    public List<PilotDtos.PilotEnrollmentResponse> getEnrollments(Long cohortId) {
        return pilotEnrollmentRepository.findByCohortIdOrderByEnrolledAtAsc(cohortId).stream()
                .map(enrollment -> pilotMapper.toEnrollmentResponse(
                        enrollment,
                        readIds(enrollment.getPreTestSummativeAttemptIds()),
                        readIds(enrollment.getPostTestSummativeAttemptIds())
                ))
                .toList();
    }

    public PilotDtos.PilotResultsResponse computeResults(Long cohortId) {
        PilotCohort cohort = getCohort(cohortId);
        List<PilotEnrollment> enrollments = pilotEnrollmentRepository.findByCohortIdOrderByEnrolledAtAsc(cohortId);
        List<PilotDtos.PilotUserResult> perUser = new ArrayList<>();
        List<Double> preVocabulary = new ArrayList<>();
        List<Double> postVocabulary = new ArrayList<>();
        List<Double> preComprehension = new ArrayList<>();
        List<Double> postComprehension = new ArrayList<>();

        for (PilotEnrollment enrollment : enrollments) {
            DiagnosticAttempt preDiagnostic = getDiagnosticAttempt(enrollment.getPreTestDiagnosticAttemptId());
            DiagnosticAttempt postDiagnostic = enrollment.getPostTestDiagnosticAttemptId() == null
                    ? null
                    : getDiagnosticAttempt(enrollment.getPostTestDiagnosticAttemptId());

            double preAverage = averageSummative(readIds(enrollment.getPreTestSummativeAttemptIds()));
            double postAverage = averageSummative(readIds(enrollment.getPostTestSummativeAttemptIds()));
            double rewriteAcceptance = computeRewriteAcceptance(enrollment);
            Double timeToFirstAction = enrollment.getFirstActionAt() == null
                    ? null
                    : Duration.between(enrollment.getEnrolledAt(), enrollment.getFirstActionAt()).toMinutes() * 1.0;
            boolean returnedWithin7Days =
                    enrollment.getLastActionAt() != null
                            && !enrollment.getLastActionAt().isBefore(enrollment.getEnrolledAt().plus(Duration.ofDays(1)))
                            && !enrollment.getLastActionAt().isAfter(enrollment.getEnrolledAt().plus(Duration.ofDays(7)));
            double passRate = postAverage >= 60.0 ? 1.0 : 0.0;

            double vocabularyDelta = (postDiagnostic == null ? preDiagnostic.getCorrectCount() : postDiagnostic.getCorrectCount()) - preDiagnostic.getCorrectCount();
            double comprehensionDelta = postAverage - preAverage;

            preVocabulary.add(preDiagnostic.getCorrectCount() * 1.0);
            postVocabulary.add(postDiagnostic == null ? preDiagnostic.getCorrectCount() * 1.0 : postDiagnostic.getCorrectCount() * 1.0);
            preComprehension.add(preAverage);
            postComprehension.add(postAverage);

            perUser.add(new PilotDtos.PilotUserResult(
                    enrollment.getUserId(),
                    vocabularyDelta,
                    comprehensionDelta,
                    rewriteAcceptance,
                    timeToFirstAction,
                    returnedWithin7Days,
                    passRate
            ));
        }

        PilotDtos.PilotMetricEntry metrics = new PilotDtos.PilotMetricEntry(
                average(perUser.stream().map(PilotDtos.PilotUserResult::vocabularySizeDelta).toList()),
                cohenDCalculator.cohenD(toArray(preVocabulary), toArray(postVocabulary)),
                average(perUser.stream().map(PilotDtos.PilotUserResult::comprehensionScoreDelta).toList()),
                cohenDCalculator.cohenD(toArray(preComprehension), toArray(postComprehension)),
                average(perUser.stream().map(PilotDtos.PilotUserResult::rewriteAcceptanceRate).toList()),
                average(perUser.stream().map(PilotDtos.PilotUserResult::timeToFirstActionMinutes).toList()),
                average(perUser.stream().map(item -> item.returnedWithin7Days() ? 1.0 : 0.0).toList()),
                average(perUser.stream().map(PilotDtos.PilotUserResult::postSummativePassRate).toList())
        );

        cohort.setState(CohortState.RESULTS_AVAILABLE);
        cohort.setCompletedAt(Instant.now());
        pilotCohortRepository.save(cohort);

        int completedCount = (int) perUser.stream().filter(item -> item.postSummativePassRate() != null).count();
        return new PilotDtos.PilotResultsResponse(
                cohort.getId(),
                cohort.getName(),
                enrollments.size(),
                completedCount,
                metrics,
                perUser
        );
    }

    public void recordAction(Long userId) {
        Instant now = Instant.now();
        for (PilotEnrollment enrollment : pilotEnrollmentRepository.findByUserId(userId)) {
            PilotCohort cohort = getCohort(enrollment.getCohortId());
            if (cohort.getState() != CohortState.INTERVENTION_PHASE && cohort.getState() != CohortState.POST_TEST_PHASE) {
                continue;
            }
            if (enrollment.getFirstActionAt() == null) {
                enrollment.setFirstActionAt(now);
            }
            enrollment.setLastActionAt(now);
            enrollment.setActionsCount(enrollment.getActionsCount() + 1);
            pilotEnrollmentRepository.save(enrollment);
        }
    }

    private PilotCohort getCohort(Long cohortId) {
        return pilotCohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Pilot cohort not found with id: " + cohortId));
    }

    private DiagnosticAttempt getDiagnosticAttempt(Long attemptId) {
        return diagnosticAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnostic attempt not found with id: " + attemptId));
    }

    private DiagnosticAttempt createDiagnosticAttempt(Long userId) {
        DiagnosticAttempt attempt = new DiagnosticAttempt();
        attempt.setUserId(userId);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setResponsesJson("[]");
        attempt.setPerLevelBreakdownJson("{}");
        attempt.setPerSkillBreakdownJson("{}");
        attempt.setCorrectCount(0);
        return diagnosticAttemptRepository.save(attempt);
    }

    private List<Long> createSummativeAttempts(Long userId) {
        List<SummativeTest> tests = summativeTestRepository.findAll().stream().filter(SummativeTest::getActive).toList();
        List<Long> attemptIds = new ArrayList<>();
        for (SummativeTest test : tests) {
            SummativeAttempt attempt = new SummativeAttempt();
            attempt.setUserId(userId);
            attempt.setSummativeTestId(test.getId());
            attempt.setCurrentPhase(SummativePhase.READING);
            attempt.setStartedAt(LocalDateTime.now());
            attemptIds.add(summativeAttemptRepository.save(attempt).getId());
        }
        return attemptIds;
    }

    private String writeIds(List<Long> ids) {
        try {
            return objectMapper.writeValueAsString(ids);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo serializar ids del piloto", exception);
        }
    }

    private List<Long> readIds(String idsJson) {
        if (idsJson == null || idsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(idsJson, new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer ids del piloto", exception);
        }
    }

    private double averageSummative(List<Long> attemptIds) {
        return attemptIds.stream()
                .map(summativeAttemptRepository::findById)
                .flatMap(Optional::stream)
                .filter(attempt -> attempt.getOverallScore() != null)
                .mapToInt(SummativeAttempt::getOverallScore)
                .average()
                .orElse(0.0);
    }

    private double computeRewriteAcceptance(PilotEnrollment enrollment) {
        List<TaskAttempt> attempts = taskAttemptRepository.findByUserIdOrderByStartedAtDesc(enrollment.getUserId()).stream()
                .filter(attempt -> !attempt.getStartedAt().atZone(ZoneId.systemDefault()).toInstant().isBefore(enrollment.getEnrolledAt()))
                .toList();
        long rewritten = attempts.stream().filter(attempt -> attempt.getRewriteAnswerEn() != null).count();
        if (rewritten == 0) {
            return 0.0;
        }
        long accepted = attempts.stream().filter(attempt -> Boolean.TRUE.equals(attempt.getRewriteAccepted())).count();
        return accepted / (double) rewritten;
    }

    private double average(List<Double> values) {
        return values.stream().filter(java.util.Objects::nonNull).mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double[] toArray(List<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).toArray();
    }
}
