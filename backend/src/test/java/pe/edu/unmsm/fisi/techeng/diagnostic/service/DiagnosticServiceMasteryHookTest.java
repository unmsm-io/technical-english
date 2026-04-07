package pe.edu.unmsm.fisi.techeng.diagnostic.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.service.CalibrationService;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.review.service.ReviewCardService;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DiagnosticServiceMasteryHookTest {

    @Mock
    private DiagnosticItemRepository diagnosticItemRepository;

    @Mock
    private DiagnosticAttemptRepository diagnosticAttemptRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewCardService reviewCardService;

    @Mock
    private CalibrationService calibrationService;

    @Mock
    private MasteryService masteryService;

    private DiagnosticService diagnosticService;

    @BeforeEach
    void setUp() {
        diagnosticService = new DiagnosticService(
                diagnosticItemRepository,
                diagnosticAttemptRepository,
                userRepository,
                new ObjectMapper(),
                reviewCardService,
                calibrationService,
                masteryService
        );
    }

    @Test
    void submitAttemptShouldFeedMasteryForEachDiagnosticItem() {
        DiagnosticAttempt attempt = new DiagnosticAttempt();
        attempt.setId(50L);
        attempt.setUserId(7L);
        attempt.setStartedAt(LocalDateTime.now());

        DiagnosticItem first = diagnosticItem(1L, 0);
        DiagnosticItem second = diagnosticItem(2L, 1);
        User user = new User();
        user.setId(7L);

        when(diagnosticAttemptRepository.findById(50L)).thenReturn(Optional.of(attempt));
        when(diagnosticItemRepository.findAllByOrderByIdAsc()).thenReturn(List.of(first, second));
        when(diagnosticAttemptRepository.save(attempt)).thenReturn(attempt);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(calibrationService.updateAbilityFromAttempt(7L, attempt)).thenReturn(new EapEstimate(0.2, 0.3, 0.09));
        when(calibrationService.predictLevel(0.2)).thenReturn(CefrLevel.A2);
        when(calibrationService.hasEnoughCalibratedItems()).thenReturn(true);

        diagnosticService.submitAttempt(50L, List.of(0, 0));

        verify(masteryService).recordResponse(7L, KcItemType.DIAGNOSTIC, 1L, true);
        verify(masteryService).recordResponse(7L, KcItemType.DIAGNOSTIC, 2L, false);
    }

    private DiagnosticItem diagnosticItem(Long id, Integer answerIdx) {
        DiagnosticItem item = new DiagnosticItem();
        item.setId(id);
        item.setCefrLevel(CefrLevel.A2);
        item.setSkill(DiagnosticSkill.GRAMMAR);
        item.setQuestionText("Q");
        item.setOptionsJson("[]");
        item.setCorrectAnswerIdx(answerIdx);
        item.setExplanationEs("E");
        return item;
    }
}
