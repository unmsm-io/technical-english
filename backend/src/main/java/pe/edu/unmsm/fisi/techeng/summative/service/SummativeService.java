package pe.edu.unmsm.fisi.techeng.summative.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.summative.dto.SummativeDtos;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativePhase;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.summative.mapper.SummativeMapper;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeTestRepository;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackPayload;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.service.TaskFeedbackService;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class SummativeService {

    private final SummativeTestRepository summativeTestRepository;
    private final SummativeAttemptRepository summativeAttemptRepository;
    private final UserRepository userRepository;
    private final TaskFeedbackService taskFeedbackService;
    private final ObjectMapper objectMapper;
    private final SummativeMapper summativeMapper;

    @Transactional(readOnly = true)
    public Page<SummativeDtos.SummativeTestResponse> list(
            TaskType type,
            CefrLevel cefrLevel,
            String query,
            Pageable pageable
    ) {
        return summativeTestRepository.search(type, cefrLevel, normalizeQuery(query), pageable)
                .map(test -> summativeMapper.toTestResponse(test, readQuestions(test).size()));
    }

    @Transactional(readOnly = true)
    public SummativeDtos.SummativeTestResponse getById(Long id) {
        SummativeTest test = getTest(id);
        return summativeMapper.toTestResponse(test, readQuestions(test).size());
    }

    @Transactional(readOnly = true)
    public SummativeDtos.SummativeTestDetailResponse getDetailById(Long id) {
        SummativeTest test = getTest(id);
        return summativeMapper.toTestDetailResponse(
                test,
                readQuestions(test).stream()
                        .map(question -> new SummativeDtos.SummativeQuestionReviewResponse(
                                question.question(),
                                question.options(),
                                null,
                                question.correctIdx(),
                                false,
                                question.explanation()
                        ))
                        .toList()
        );
    }

    public SummativeDtos.SummativeAttemptResponse start(Long userId, Long testId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        SummativeTest test = getTest(testId);

        SummativeAttempt attempt = new SummativeAttempt();
        attempt.setUserId(userId);
        attempt.setSummativeTestId(test.getId());
        attempt.setCurrentPhase(SummativePhase.READING);
        attempt.setStartedAt(LocalDateTime.now());
        return toAttemptResponse(summativeAttemptRepository.save(attempt));
    }

    public SummativeDtos.SummativeAttemptResponse advancePhase(Long attemptId, SummativePhase nextPhase) {
        SummativeAttempt attempt = getAttempt(attemptId);
        validateTransition(attempt.getCurrentPhase(), nextPhase);
        attempt.setCurrentPhase(nextPhase);
        return toAttemptResponse(summativeAttemptRepository.save(attempt));
    }

    public SummativeDtos.SummativeAttemptResponse submitProduction(Long attemptId, String answerEn) {
        SummativeAttempt attempt = getAttempt(attemptId);
        if (attempt.getCurrentPhase() != SummativePhase.PRODUCTION) {
            throw new BusinessRuleException("Solo se puede enviar produccion en la fase PRODUCTION");
        }

        SummativeTest test = getTest(attempt.getSummativeTestId());
        String normalizedAnswer = answerEn.trim();
        TaskFeedbackPayload payload = taskFeedbackService.generateFeedback(
                buildSyntheticTask(test),
                normalizedAnswer,
                test.getCefrLevel().name()
        );

        attempt.setProductionAnswerEn(normalizedAnswer);
        attempt.setProductionScore(payload.correctness());
        attempt.setProductionFeedbackJson(writeValue(payload));
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setCurrentPhase(SummativePhase.COMPREHENSION);
        return toAttemptResponse(summativeAttemptRepository.save(attempt));
    }

    public SummativeDtos.SummativeResultResponse submitComprehension(Long attemptId, List<Integer> answerIdxs) {
        SummativeAttempt attempt = getAttempt(attemptId);
        if (attempt.getCurrentPhase() != SummativePhase.COMPREHENSION) {
            throw new BusinessRuleException("Solo se puede enviar comprension en la fase COMPREHENSION");
        }
        if (attempt.getProductionScore() == null) {
            throw new BusinessRuleException("Primero debes completar la fase de produccion");
        }

        SummativeTest test = getTest(attempt.getSummativeTestId());
        List<SummativeQuestionSeed> questions = readQuestions(test);
        if (answerIdxs.size() != questions.size()) {
            throw new BusinessRuleException("La cantidad de respuestas de comprension no coincide con el test");
        }

        int correctAnswers = 0;
        List<SummativeDtos.SummativeComprehensionResponseItem> responses = new ArrayList<>();
        List<SummativeDtos.SummativeQuestionReviewResponse> review = new ArrayList<>();
        for (int index = 0; index < questions.size(); index++) {
            SummativeQuestionSeed question = questions.get(index);
            Integer selectedAnswer = answerIdxs.get(index);
            boolean correct = selectedAnswer != null && selectedAnswer.equals(question.correctIdx());
            if (correct) {
                correctAnswers++;
            }
            responses.add(new SummativeDtos.SummativeComprehensionResponseItem(index, selectedAnswer, correct));
            review.add(new SummativeDtos.SummativeQuestionReviewResponse(
                    question.question(),
                    question.options(),
                    selectedAnswer,
                    question.correctIdx(),
                    correct,
                    question.explanation()
            ));
        }

        int comprehensionScore = Math.round((correctAnswers * 100f) / questions.size());
        int overallScore = Math.round(attempt.getProductionScore() * 0.6f + comprehensionScore * 0.4f);
        boolean passed = overallScore >= test.getPassingScore();

        attempt.setComprehensionResponsesJson(writeValue(responses));
        attempt.setComprehensionScore(comprehensionScore);
        attempt.setOverallScore(overallScore);
        attempt.setPassed(passed);
        attempt.setCurrentPhase(SummativePhase.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());
        SummativeAttempt savedAttempt = summativeAttemptRepository.save(attempt);
        return summativeMapper.toResultResponse(
                savedAttempt,
                test,
                readProductionFeedback(savedAttempt),
                review
        );
    }

    @Transactional(readOnly = true)
    public List<SummativeDtos.SummativeAttemptHistoryResponse> getHistory(Long userId) {
        return summativeAttemptRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(attempt -> summativeMapper.toHistoryResponse(
                        attempt,
                        getTest(attempt.getSummativeTestId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public SummativeDtos.SummativeAttemptResponse getAttemptById(Long attemptId) {
        return toAttemptResponse(getAttempt(attemptId));
    }

    private SummativeAttempt getAttempt(Long attemptId) {
        return summativeAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Summative attempt not found with id: " + attemptId));
    }

    private SummativeTest getTest(Long testId) {
        return summativeTestRepository.findByIdAndActiveTrue(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Summative test not found with id: " + testId));
    }

    private SummativeDtos.SummativeAttemptResponse toAttemptResponse(SummativeAttempt attempt) {
        return summativeMapper.toAttemptResponse(
                attempt,
                readProductionFeedback(attempt),
                readComprehensionResponses(attempt)
        );
    }

    private List<SummativeQuestionSeed> readQuestions(SummativeTest test) {
        try {
            return objectMapper.readValue(test.getComprehensionQuestionsJson(), new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer las preguntas de comprension sumativa", exception);
        }
    }

    private TaskFeedbackPayload readProductionFeedback(SummativeAttempt attempt) {
        if (attempt.getProductionFeedbackJson() == null || attempt.getProductionFeedbackJson().isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(attempt.getProductionFeedbackJson(), TaskFeedbackPayload.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer el feedback de produccion sumativa", exception);
        }
    }

    private List<SummativeDtos.SummativeComprehensionResponseItem> readComprehensionResponses(SummativeAttempt attempt) {
        if (attempt.getComprehensionResponsesJson() == null || attempt.getComprehensionResponsesJson().isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(attempt.getComprehensionResponsesJson(), new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer las respuestas de comprension sumativa", exception);
        }
    }

    private String writeValue(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo serializar el estado sumativo", exception);
        }
    }

    private void validateTransition(SummativePhase currentPhase, SummativePhase nextPhase) {
        SummativePhase expected = switch (currentPhase) {
            case READING -> SummativePhase.PRODUCTION;
            case PRODUCTION -> SummativePhase.COMPREHENSION;
            case COMPREHENSION -> SummativePhase.COMPLETED;
            case COMPLETED -> throw new BusinessRuleException("El intento sumativo ya fue completado");
        };
        if (expected != nextPhase) {
            throw new BusinessRuleException("Transicion sumativa invalida: " + currentPhase + " -> " + nextPhase);
        }
    }

    private String normalizeQuery(String query) {
        return query == null || query.isBlank() ? null : query.trim();
    }

    private Task buildSyntheticTask(SummativeTest test) {
        Task task = new Task();
        task.setId(test.getId());
        task.setTaskType(test.getTaskType());
        task.setDuringTaskInstructionEs(test.getProductionInstructionEs());
        task.setDuringTaskPromptEn(test.getReadingSpecEn());
        task.setExpectedAnswerEn(test.getProductionExpectedAnswerEn());
        task.setPostTaskLanguageFocus("clarity, technical precision, and engineering register");
        task.setPostTaskExplanationEs("La fase productiva de la prueba final mide claridad, precision tecnica y comprension del texto fuente.");
        return task;
    }

    private record SummativeQuestionSeed(
            String question,
            List<String> options,
            Integer correctIdx,
            String explanation
    ) {}
}
