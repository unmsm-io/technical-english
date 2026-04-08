package pe.edu.unmsm.fisi.techeng.task.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskAttemptResponse;
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
class TaskAttemptServiceTest {

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
    void advancePhase_shouldMoveToNextValidPhase() {
        TaskAttempt attempt = sampleAttempt(TaskPhase.PRE_TASK);
        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(taskAttemptRepository.save(any(TaskAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskAttemptResponse response = taskAttemptService.advancePhase(1L, TaskPhase.DURING_TASK);

        assertThat(response.phase()).isEqualTo(TaskPhase.DURING_TASK);
    }

    @Test
    void advancePhase_shouldRejectInvalidTransition() {
        TaskAttempt attempt = sampleAttempt(TaskPhase.PRE_TASK);
        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));

        assertThatThrownBy(() -> taskAttemptService.advancePhase(1L, TaskPhase.COMPLETED))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Transicion de fase invalida");
    }

    @Test
    void submit_shouldPersistFeedbackAndMoveToPostTask() {
        TaskAttempt attempt = sampleAttempt(TaskPhase.DURING_TASK);
        Task task = new Task();
        task.setId(10L);
        task.setTaskType(TaskType.ERROR_MESSAGE);
        task.setExpectedAnswerEn("Reference");
        task.setPostTaskExplanationEs("Explanation");
        task.setDuringTaskInstructionEs("Instruction");
        task.setDuringTaskPromptEn("Prompt");
        task.setPostTaskLanguageFocus("{\"grammar\":\"present simple\"}");

        User user = new User();
        user.setId(20L);
        user.setEnglishLevel("B1");

        TaskFeedbackPayload payload = new TaskFeedbackPayload(
                88,
                java.util.List.of("Clear structure"),
                java.util.List.of(),
                "Improved answer",
                "Use better discourse markers."
        );

        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(taskRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(task));
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(taskFeedbackService.generateFeedback(task, "User answer", "B1")).thenReturn(payload);
        when(taskAttemptRepository.save(any(TaskAttempt.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskFeedbackResponse response = taskAttemptService.submit(1L, "User answer");

        assertThat(response.score()).isEqualTo(88);
        assertThat(response.llmFeedbackPayload().improvedAnswer()).isEqualTo("Improved answer");
        assertThat(attempt.getPhase()).isEqualTo(TaskPhase.POST_TASK);
        assertThat(attempt.getSubmittedAt()).isNotNull();
        assertThat(attempt.getLlmFeedbackJson()).contains("\"correctness\":88");
    }

    private TaskAttempt sampleAttempt(TaskPhase phase) {
        TaskAttempt attempt = new TaskAttempt();
        attempt.setId(1L);
        attempt.setTaskId(10L);
        attempt.setUserId(20L);
        attempt.setPhase(phase);
        attempt.setStartedAt(LocalDateTime.now());
        return attempt;
    }
}
