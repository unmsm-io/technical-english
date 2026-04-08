package pe.edu.unmsm.fisi.techeng.task.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackResponse;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TaskAttemptRewriteTest {

    @Mock
    private TaskAttemptRepository taskAttemptRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskFeedbackService taskFeedbackService;

    @Mock
    private MasteryService masteryService;

    private TaskAttemptService taskAttemptService;

    @BeforeEach
    void setUp() {
        taskAttemptService = new TaskAttemptService(
                taskAttemptRepository,
                taskRepository,
                userRepository,
                taskFeedbackService,
                new ObjectMapper(),
                masteryService
        );
    }

    @Test
    void submitRewriteShouldRequireOriginalSubmission() {
        TaskAttempt attempt = new TaskAttempt();
        attempt.setId(1L);
        attempt.setTaskId(10L);
        attempt.setUserId(20L);
        attempt.setPhase(TaskPhase.POST_TASK);
        attempt.setStartedAt(LocalDateTime.now());

        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> taskAttemptService.submitRewrite(1L, "Improved answer"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Primero debes enviar la respuesta original");
    }

    @Test
    void submitRewriteShouldPersistScoreAndAcceptance() {
        TaskAttempt attempt = new TaskAttempt();
        attempt.setId(1L);
        attempt.setTaskId(10L);
        attempt.setUserId(20L);
        attempt.setPhase(TaskPhase.POST_TASK);
        attempt.setUserAnswerEn("The server fail because token expired.");
        attempt.setScore(55);
        attempt.setSubmittedAt(LocalDateTime.now().minusMinutes(5));
        attempt.setStartedAt(LocalDateTime.now().minusMinutes(10));

        Task task = new Task();
        task.setId(10L);
        task.setTaskType(TaskType.API_DOC);
        task.setExpectedAnswerEn("The server fails because the token expired.");
        task.setPostTaskExplanationEs("Explicacion");
        task.setDuringTaskInstructionEs("Instruccion");
        task.setDuringTaskPromptEn("Prompt");
        task.setPostTaskLanguageFocus("Focus");

        User user = new User();
        user.setId(20L);
        user.setEnglishLevel("B1");

        TaskFeedbackPayload payload = new TaskFeedbackPayload(
                82,
                java.util.List.of("Clearer sentence"),
                java.util.List.of(),
                "The server fails because the token expired.",
                "Use present simple accurately."
        );

        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(taskRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(task));
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(taskFeedbackService.generateFeedback(task, "The server fails because the token expired.", "B1"))
                .thenReturn(payload);
        when(taskAttemptRepository.save(any(TaskAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskFeedbackResponse response = taskAttemptService.submitRewrite(1L, "The server fails because the token expired.");

        assertThat(response.score()).isEqualTo(82);
        assertThat(attempt.getRewriteAnswerEn()).isEqualTo("The server fails because the token expired.");
        assertThat(attempt.getRewriteScore()).isEqualTo(82);
        assertThat(attempt.getRewriteAccepted()).isTrue();
        assertThat(attempt.getRewriteSubmittedAt()).isNotNull();
        assertThat(attempt.getRewriteFeedbackJson()).contains("\"correctness\":82");
        verify(masteryService).recordResponse(20L, KcItemType.TASK, 10L, true);
    }
}
