package pe.edu.unmsm.fisi.techeng.summative.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.summative.dto.SummativeDtos;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativePhase;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.summative.mapper.SummativeMapper;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeTestRepository;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.service.TaskFeedbackService;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SummativeServiceTest {

    @Mock
    private SummativeTestRepository summativeTestRepository;

    @Mock
    private SummativeAttemptRepository summativeAttemptRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskFeedbackService taskFeedbackService;

    private SummativeService summativeService;

    @BeforeEach
    void setUp() {
        summativeService = new SummativeService(
                summativeTestRepository,
                summativeAttemptRepository,
                userRepository,
                taskFeedbackService,
                new ObjectMapper(),
                new SummativeMapper()
        );
    }

    @Test
    void advancePhaseShouldRejectInvalidTransition() {
        SummativeAttempt attempt = new SummativeAttempt();
        attempt.setId(1L);
        attempt.setCurrentPhase(SummativePhase.READING);

        when(summativeAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> summativeService.advancePhase(1L, SummativePhase.COMPREHENSION))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Transicion sumativa invalida");
    }

    @Test
    void submitComprehensionShouldComputeWeightedOverallScore() {
        SummativeTest test = new SummativeTest();
        test.setId(10L);
        test.setTaskType(TaskType.API_DOC);
        test.setCefrLevel(CefrLevel.B1);
        test.setTitleEs("API");
        test.setDescriptionEs("Desc");
        test.setReadingSpecEn("Spec");
        test.setReadingContextEs("Context");
        test.setProductionInstructionEs("Instruction");
        test.setProductionExpectedAnswerEn("Expected");
        test.setComprehensionQuestionsJson("""
                [
                  {"question":"Q1","options":["A","B","C"],"correctIdx":1,"explanation":"E1"},
                  {"question":"Q2","options":["A","B","C"],"correctIdx":0,"explanation":"E2"},
                  {"question":"Q3","options":["A","B","C"],"correctIdx":2,"explanation":"E3"}
                ]
                """);
        test.setPassingScore(60);
        test.setActive(true);

        SummativeAttempt attempt = new SummativeAttempt();
        attempt.setId(1L);
        attempt.setSummativeTestId(10L);
        attempt.setUserId(20L);
        attempt.setCurrentPhase(SummativePhase.COMPREHENSION);
        attempt.setProductionAnswerEn("Answer");
        attempt.setProductionScore(80);
        attempt.setProductionFeedbackJson(new ObjectMapper().valueToTree(new TaskFeedbackPayload(
                80,
                List.of("Clear"),
                List.of(),
                "Improved",
                "Focus"
        )).toString());
        attempt.setStartedAt(LocalDateTime.now().minusMinutes(10));
        attempt.setSubmittedAt(LocalDateTime.now().minusMinutes(5));

        when(summativeAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(summativeTestRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(test));
        when(summativeAttemptRepository.save(any(SummativeAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SummativeDtos.SummativeResultResponse response = summativeService.submitComprehension(1L, List.of(1, 0, 1));

        assertThat(response.comprehensionScore()).isEqualTo(67);
        assertThat(response.overallScore()).isEqualTo(75);
        assertThat(response.passed()).isTrue();
        assertThat(response.comprehensionReview()).hasSize(3);
    }

    @Test
    void submitProductionShouldPersistFeedbackAndAdvancePhase() {
        User user = new User();
        user.setId(20L);

        SummativeTest test = new SummativeTest();
        test.setId(10L);
        test.setTaskType(TaskType.PR_DESC);
        test.setCefrLevel(CefrLevel.B1);
        test.setTitleEs("PR");
        test.setDescriptionEs("Desc");
        test.setReadingSpecEn("Spec");
        test.setReadingContextEs("Context");
        test.setProductionInstructionEs("Instruction");
        test.setProductionExpectedAnswerEn("Expected");
        test.setComprehensionQuestionsJson("[]");
        test.setPassingScore(60);
        test.setActive(true);

        SummativeAttempt attempt = new SummativeAttempt();
        attempt.setId(1L);
        attempt.setSummativeTestId(10L);
        attempt.setUserId(20L);
        attempt.setCurrentPhase(SummativePhase.PRODUCTION);
        attempt.setStartedAt(LocalDateTime.now().minusMinutes(3));

        when(summativeAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(summativeTestRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(test));
        when(taskFeedbackService.generateFeedback(any(), any(), any())).thenReturn(new TaskFeedbackPayload(
                86,
                List.of("Strong summary"),
                List.of(),
                "Improved",
                "Focus"
        ));
        when(summativeAttemptRepository.save(any(SummativeAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SummativeDtos.SummativeAttemptResponse response = summativeService.submitProduction(1L, "Summary");

        assertThat(response.currentPhase()).isEqualTo(SummativePhase.COMPREHENSION);
        assertThat(response.productionScore()).isEqualTo(86);
        assertThat(response.productionFeedbackPayload()).isNotNull();
    }
}
