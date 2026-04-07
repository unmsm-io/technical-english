package pe.edu.unmsm.fisi.techeng.task.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskAttemptHistoryResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskAttemptResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackResponse;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskAttemptService {

    private final TaskAttemptRepository taskAttemptRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskFeedbackService taskFeedbackService;
    private final ObjectMapper objectMapper;

    public TaskAttemptResponse start(Long userId, Long taskId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        taskRepository.findByIdAndActiveTrue(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        return taskAttemptRepository.findFirstByUserIdAndTaskIdAndPhaseNot(userId, taskId, TaskPhase.COMPLETED)
                .map(this::toAttemptResponse)
                .orElseGet(() -> {
                    TaskAttempt attempt = new TaskAttempt();
                    attempt.setUserId(userId);
                    attempt.setTaskId(taskId);
                    attempt.setPhase(TaskPhase.PRE_TASK);
                    attempt.setStartedAt(LocalDateTime.now());
                    return toAttemptResponse(taskAttemptRepository.save(attempt));
                });
    }

    public TaskAttemptResponse advancePhase(Long attemptId, TaskPhase nextPhase) {
        TaskAttempt attempt = getAttemptEntity(attemptId);
        validateTransition(attempt.getPhase(), nextPhase);
        attempt.setPhase(nextPhase);
        return toAttemptResponse(taskAttemptRepository.save(attempt));
    }

    public TaskFeedbackResponse submit(Long attemptId, String userAnswerEn) {
        TaskAttempt attempt = getAttemptEntity(attemptId);
        if (attempt.getPhase() != TaskPhase.DURING_TASK) {
            throw new BusinessRuleException("Solo se puede enviar una respuesta desde la fase DURING_TASK");
        }

        Task task = taskRepository.findByIdAndActiveTrue(attempt.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + attempt.getTaskId()));
        User user = userRepository.findById(attempt.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + attempt.getUserId()));

        String cefrLevel = user.getEnglishLevel() == null || user.getEnglishLevel().isBlank()
                ? CefrLevel.A2.name()
                : user.getEnglishLevel();

        TaskFeedbackPayload payload = taskFeedbackService.generateFeedback(task, userAnswerEn, cefrLevel);

        attempt.setUserAnswerEn(userAnswerEn.trim());
        attempt.setPhase(TaskPhase.POST_TASK);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setLlmFeedbackCefr(cefrLevel);
        attempt.setLlmFeedbackJson(writeJson(payload));
        attempt.setScore(payload.correctness());
        TaskAttempt savedAttempt = taskAttemptRepository.save(attempt);

        return new TaskFeedbackResponse(
                savedAttempt.getId(),
                task.getId(),
                task.getTaskType(),
                savedAttempt.getScore(),
                savedAttempt.getUserAnswerEn(),
                task.getExpectedAnswerEn(),
                task.getPostTaskExplanationEs(),
                payload,
                payload.languageFocusComments(),
                payload.improvedAnswer()
        );
    }

    public TaskAttemptResponse complete(Long attemptId) {
        TaskAttempt attempt = getAttemptEntity(attemptId);
        if (attempt.getPhase() != TaskPhase.POST_TASK) {
            throw new BusinessRuleException("Solo se puede completar una tarea despues del feedback");
        }
        attempt.setPhase(TaskPhase.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());
        return toAttemptResponse(taskAttemptRepository.save(attempt));
    }

    @Transactional(readOnly = true)
    public List<TaskAttemptHistoryResponse> getHistory(Long userId) {
        return taskAttemptRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(attempt -> {
                    Task task = taskRepository.findById(attempt.getTaskId())
                            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + attempt.getTaskId()));
                    return new TaskAttemptHistoryResponse(
                            attempt.getId(),
                            task.getId(),
                            task.getTitleEs(),
                            task.getTaskType(),
                            attempt.getScore(),
                            attempt.getCompletedAt()
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskAttemptResponse getById(Long attemptId) {
        return toAttemptResponse(getAttemptEntity(attemptId));
    }

    private TaskAttempt getAttemptEntity(Long attemptId) {
        return taskAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Task attempt not found with id: " + attemptId));
    }

    private TaskAttemptResponse toAttemptResponse(TaskAttempt attempt) {
        return new TaskAttemptResponse(
                attempt.getId(),
                attempt.getTaskId(),
                attempt.getUserId(),
                attempt.getPhase(),
                attempt.getUserAnswerEn(),
                readFeedback(attempt.getLlmFeedbackJson()),
                attempt.getLlmFeedbackCefr(),
                attempt.getScore(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getCompletedAt()
        );
    }

    private void validateTransition(TaskPhase currentPhase, TaskPhase nextPhase) {
        TaskPhase expectedNextPhase = switch (currentPhase) {
            case PRE_TASK -> TaskPhase.DURING_TASK;
            case DURING_TASK -> TaskPhase.POST_TASK;
            case POST_TASK -> TaskPhase.COMPLETED;
            case COMPLETED -> throw new BusinessRuleException("La tarea ya fue completada");
        };

        if (nextPhase != expectedNextPhase) {
            throw new BusinessRuleException("Transicion de fase invalida: " + currentPhase + " -> " + nextPhase);
        }
    }

    private String writeJson(TaskFeedbackPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo serializar el feedback de la tarea", exception);
        }
    }

    private TaskFeedbackPayload readFeedback(String payloadJson) {
        if (payloadJson == null || payloadJson.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(payloadJson, TaskFeedbackPayload.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer el feedback almacenado de la tarea", exception);
        }
    }
}
