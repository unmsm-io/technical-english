package pe.edu.unmsm.fisi.techeng.task.service;

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
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TaskAttemptServiceMasteryHookTest {

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
    void submitShouldFeedMasteryWithBinaryThreshold() {
        TaskAttempt attempt = new TaskAttempt();
        attempt.setId(1L);
        attempt.setTaskId(10L);
        attempt.setUserId(20L);
        attempt.setPhase(TaskPhase.DURING_TASK);
        attempt.setStartedAt(LocalDateTime.now());

        Task task = new Task();
        task.setId(10L);
        task.setTaskType(TaskType.CODE_REVIEW);
        task.setExpectedAnswerEn("Reference");
        task.setPostTaskExplanationEs("Explanation");
        task.setDuringTaskInstructionEs("Instruction");
        task.setDuringTaskPromptEn("Prompt");
        task.setPostTaskLanguageFocus("Focus");

        User user = new User();
        user.setId(20L);
        user.setEnglishLevel("B1");

        TaskFeedbackPayload payload = new TaskFeedbackPayload(
                72,
                java.util.List.of("Well done"),
                java.util.List.of(),
                "Improved",
                "Focus"
        );

        when(taskAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(taskRepository.findByIdAndActiveTrue(10L)).thenReturn(Optional.of(task));
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(taskFeedbackService.generateFeedback(task, "User answer", "B1")).thenReturn(payload);
        when(taskAttemptRepository.save(attempt)).thenReturn(attempt);

        taskAttemptService.submit(1L, "User answer");

        verify(masteryService).recordResponse(20L, KcItemType.TASK, 10L, true);
    }
}
