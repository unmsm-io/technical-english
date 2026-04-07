package pe.edu.unmsm.fisi.techeng.calibration.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationRunResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationStatus;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CalibrationServiceTest {

    @Mock
    private DiagnosticAttemptRepository diagnosticAttemptRepository;

    @Mock
    private DiagnosticItemRepository diagnosticItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AbilityEstimator abilityEstimator;

    @Mock
    private ItemCalibrator itemCalibrator;

    private CalibrationService calibrationService;

    @BeforeEach
    void setUp() {
        calibrationService = new CalibrationService(
                diagnosticAttemptRepository,
                diagnosticItemRepository,
                userRepository,
                abilityEstimator,
                itemCalibrator,
                new ObjectMapper()
        );
    }

    @Test
    void updateAbilityFromAttempt_shouldPersistThetaAndStandardError() throws Exception {
        User user = new User();
        user.setId(15L);

        DiagnosticItem item = diagnosticItem(1L, CefrLevel.B1, 0.2d);
        DiagnosticAttempt attempt = new DiagnosticAttempt();
        attempt.setUserId(15L);
        attempt.setResponsesJson(new ObjectMapper().writeValueAsString(List.of(1)));

        when(userRepository.findById(15L)).thenReturn(Optional.of(user));
        when(diagnosticItemRepository.findAllByOrderByIdAsc()).thenReturn(List.of(item));
        when(abilityEstimator.estimateTheta(any(), any())).thenReturn(new EapEstimate(0.83d, 0.42d, 0.1764d));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EapEstimate estimate = calibrationService.updateAbilityFromAttempt(15L, attempt);

        assertThat(estimate.theta()).isEqualTo(0.83d);
        assertThat(user.getAbilityTheta()).isEqualTo(0.83d);
        assertThat(user.getAbilityStandardError()).isEqualTo(0.42d);
        assertThat(user.getLastAbilityUpdate()).isNotNull();
    }

    @Test
    void runCalibrationCycle_shouldUpdateItemFieldsFromCalibratorOutput() throws Exception {
        DiagnosticItem itemA = diagnosticItem(1L, CefrLevel.A2, null);
        DiagnosticItem itemB = diagnosticItem(2L, CefrLevel.B2, null);

        DiagnosticAttempt attemptOne = new DiagnosticAttempt();
        attemptOne.setId(100L);
        attemptOne.setUserId(1L);
        attemptOne.setResponsesJson(new ObjectMapper().writeValueAsString(List.of(1, 0)));
        attemptOne.setCompletedAt(java.time.LocalDateTime.now());

        DiagnosticAttempt attemptTwo = new DiagnosticAttempt();
        attemptTwo.setId(101L);
        attemptTwo.setUserId(2L);
        attemptTwo.setResponsesJson(new ObjectMapper().writeValueAsString(List.of(1, 1)));
        attemptTwo.setCompletedAt(java.time.LocalDateTime.now());

        when(diagnosticAttemptRepository.findByCompletedAtIsNotNullOrderByIdAsc())
                .thenReturn(List.of(attemptOne, attemptTwo));
        when(diagnosticItemRepository.findAllByOrderByIdAsc()).thenReturn(List.of(itemA, itemB));
        when(itemCalibrator.calibrateItems(any())).thenReturn(Map.of(
                1L, new ItemParams(-0.6d, 1.0d),
                2L, new ItemParams(0.8d, 1.0d)
        ));
        when(diagnosticItemRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        CalibrationRunResponse response = calibrationService.runCalibrationCycle();

        assertThat(response.itemsCalibrated()).isZero();
        assertThat(itemA.getResponseCount()).isEqualTo(2);
        assertThat(itemB.getResponseCount()).isEqualTo(2);
        assertThat(itemA.getCalibrationStatus()).isEqualTo(CalibrationStatus.UNCALIBRATED);
        assertThat(itemB.getCalibrationStatus()).isEqualTo(CalibrationStatus.UNCALIBRATED);
        assertThat(itemA.getDifficulty()).isNull();
    }

    private DiagnosticItem diagnosticItem(Long id, CefrLevel level, Double difficulty) {
        DiagnosticItem item = new DiagnosticItem();
        item.setId(id);
        item.setCefrLevel(level);
        item.setSkill(DiagnosticSkill.READING);
        item.setQuestionText("Question " + id);
        item.setOptionsJson("[\"A\",\"B\"]");
        item.setCorrectAnswerIdx(1);
        item.setExplanationEs("Explanation");
        item.setDifficulty(difficulty);
        item.setDiscrimination(1.0d);
        item.setResponseCount(0);
        item.setCalibrationStatus(CalibrationStatus.UNCALIBRATED);
        item.setLastCalibratedAt((Instant) null);
        return item;
    }
}
