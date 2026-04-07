package pe.edu.unmsm.fisi.techeng.diagnostic.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticAttemptHistoryResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticAttemptStartResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticItemResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticResultResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.review.service.ReviewCardService;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.service.CalibrationService;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class DiagnosticService {

    private final DiagnosticItemRepository diagnosticItemRepository;
    private final DiagnosticAttemptRepository diagnosticAttemptRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ReviewCardService reviewCardService;
    private final CalibrationService calibrationService;

    public DiagnosticAttemptStartResponse startAttempt(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<DiagnosticItem> items = diagnosticItemRepository.findAllByOrderByIdAsc();
        if (items.isEmpty()) {
            throw new BusinessRuleException("No hay items diagnosticos cargados");
        }

        DiagnosticAttempt attempt = new DiagnosticAttempt();
        attempt.setUserId(user.getId());
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setResponsesJson(writeValue(List.of()));
        attempt.setPerLevelBreakdownJson(writeValue(Map.of()));
        attempt.setPerSkillBreakdownJson(writeValue(Map.of()));

        DiagnosticAttempt savedAttempt = diagnosticAttemptRepository.save(attempt);

        return new DiagnosticAttemptStartResponse(
                savedAttempt.getId(),
                savedAttempt.getUserId(),
                savedAttempt.getStartedAt(),
                items.stream().map(this::toItemResponse).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<DiagnosticAttemptHistoryResponse> getHistory(Long userId) {
        return diagnosticAttemptRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(attempt -> new DiagnosticAttemptHistoryResponse(
                        attempt.getId(),
                        attempt.getUserId(),
                        attempt.getPlacedLevel(),
                        attempt.getCorrectCount(),
                        attempt.getStartedAt(),
                        attempt.getCompletedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiagnosticItemResponse> getItems() {
        return diagnosticItemRepository.findAllByOrderByIdAsc().stream()
                .map(this::toItemResponse)
                .toList();
    }

    public DiagnosticResultResponse submitAttempt(Long attemptId, List<Integer> responses) {
        DiagnosticAttempt attempt = diagnosticAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnostic attempt not found with id: " + attemptId));

        if (attempt.getCompletedAt() != null) {
            throw new BusinessRuleException("El intento ya fue enviado");
        }

        List<DiagnosticItem> items = diagnosticItemRepository.findAllByOrderByIdAsc();
        if (responses.size() != items.size()) {
            throw new BusinessRuleException("La cantidad de respuestas no coincide con los items del diagnostico");
        }

        LinkedHashMap<String, Integer> perLevelBreakdown = initializeLevelBreakdown();
        LinkedHashMap<String, Integer> perSkillBreakdown = initializeSkillBreakdown();

        int correctCount = 0;
        for (int index = 0; index < items.size(); index++) {
            DiagnosticItem item = items.get(index);
            Integer answer = responses.get(index);
            if (answer != null && answer.equals(item.getCorrectAnswerIdx())) {
                correctCount++;
                perLevelBreakdown.merge(item.getCefrLevel().name(), 1, Integer::sum);
                perSkillBreakdown.merge(item.getSkill().name(), 1, Integer::sum);
            }
        }

        CefrLevel placementLegacy = computePlacement(perLevelBreakdown);

        attempt.setResponsesJson(writeValue(responses));
        attempt.setCorrectCount(correctCount);
        attempt.setPlacedLevel(placementLegacy);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setPerLevelBreakdownJson(writeValue(perLevelBreakdown));
        attempt.setPerSkillBreakdownJson(writeValue(perSkillBreakdown));
        DiagnosticAttempt savedAttempt = diagnosticAttemptRepository.save(attempt);

        EapEstimate abilityEstimate = calibrationService.updateAbilityFromAttempt(attempt.getUserId(), savedAttempt);
        CefrLevel predictedCefr = calibrationService.predictLevel(abilityEstimate.theta());
        CefrLevel finalPlacement = placementLegacy;
        if (predictedCefr != null && calibrationService.hasEnoughCalibratedItems()) {
            finalPlacement = predictedCefr;
        }
        Integer vocabularySize = vocabularySizeForLevel(finalPlacement);

        User user = userRepository.findById(attempt.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + attempt.getUserId()));
        user.setEnglishLevel(finalPlacement.name());
        user.setDiagnosticCompleted(Boolean.TRUE);
        user.setDiagnosticCompletedAt(savedAttempt.getCompletedAt());
        user.setVocabularySize(vocabularySize);
        userRepository.save(user);

        try {
            reviewCardService.bootstrapForUser(user.getId(), finalPlacement);
        } catch (Exception exception) {
            org.slf4j.LoggerFactory.getLogger(DiagnosticService.class)
                    .warn("Review bootstrap failed for user {}", user.getId(), exception);
        }

        return new DiagnosticResultResponse(
                savedAttempt.getId(),
                savedAttempt.getUserId(),
                finalPlacement,
                placementLegacy,
                correctCount,
                items.size(),
                perLevelBreakdown,
                perSkillBreakdown,
                vocabularySize,
                abilityEstimate.theta(),
                abilityEstimate.standardError(),
                predictedCefr,
                savedAttempt.getCompletedAt()
        );
    }

    public CefrLevel computePlacement(List<DiagnosticItem> items, List<Integer> responses) {
        LinkedHashMap<String, Integer> perLevelBreakdown = initializeLevelBreakdown();
        for (int index = 0; index < items.size(); index++) {
            DiagnosticItem item = items.get(index);
            if (responses.get(index) != null && responses.get(index).equals(item.getCorrectAnswerIdx())) {
                perLevelBreakdown.merge(item.getCefrLevel().name(), 1, Integer::sum);
            }
        }
        return computePlacement(perLevelBreakdown);
    }

    private CefrLevel computePlacement(Map<String, Integer> perLevelBreakdown) {
        CefrLevel placement = CefrLevel.A1;
        for (CefrLevel level : List.of(CefrLevel.A1, CefrLevel.A2, CefrLevel.B1, CefrLevel.B2, CefrLevel.C1)) {
            if (perLevelBreakdown.getOrDefault(level.name(), 0) >= 2) {
                placement = level;
            }
        }
        return placement;
    }

    private Integer vocabularySizeForLevel(CefrLevel placement) {
        return switch (placement) {
            case A1 -> 500;
            case A2 -> 1200;
            case B1 -> 2000;
            case B2 -> 3500;
            case C1, C2 -> 5000;
        };
    }

    private LinkedHashMap<String, Integer> initializeLevelBreakdown() {
        LinkedHashMap<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put(CefrLevel.A1.name(), 0);
        breakdown.put(CefrLevel.A2.name(), 0);
        breakdown.put(CefrLevel.B1.name(), 0);
        breakdown.put(CefrLevel.B2.name(), 0);
        breakdown.put(CefrLevel.C1.name(), 0);
        return breakdown;
    }

    private LinkedHashMap<String, Integer> initializeSkillBreakdown() {
        LinkedHashMap<String, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put(DiagnosticSkill.READING.name(), 0);
        breakdown.put(DiagnosticSkill.VOCAB.name(), 0);
        breakdown.put(DiagnosticSkill.GRAMMAR.name(), 0);
        return breakdown;
    }

    private DiagnosticItemResponse toItemResponse(DiagnosticItem item) {
        return new DiagnosticItemResponse(
                item.getId(),
                item.getCefrLevel(),
                item.getSkill(),
                item.getQuestionText(),
                readOptions(item.getOptionsJson())
        );
    }

    private List<String> readOptions(String optionsJson) {
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer las opciones del diagnostico", exception);
        }
    }

    private String writeValue(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo serializar el diagnostico", exception);
        }
    }
}
