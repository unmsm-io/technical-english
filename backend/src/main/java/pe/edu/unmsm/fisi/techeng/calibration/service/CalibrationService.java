package pe.edu.unmsm.fisi.techeng.calibration.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibratedItemResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationRunResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationStatsResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationStatus;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;
import pe.edu.unmsm.fisi.techeng.calibration.dto.UserAbilityResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticAttemptRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@Transactional
public class CalibrationService {

    private static final int MIN_RESPONSES_FOR_ESTIMATION = 30;
    private static final int MIN_RESPONSES_FOR_CONVERGENCE = 200;

    private final DiagnosticAttemptRepository diagnosticAttemptRepository;
    private final DiagnosticItemRepository diagnosticItemRepository;
    private final UserRepository userRepository;
    private final AbilityEstimator abilityEstimator;
    private final ItemCalibrator itemCalibrator;
    private final ObjectMapper objectMapper;

    public CalibrationService(
            DiagnosticAttemptRepository diagnosticAttemptRepository,
            DiagnosticItemRepository diagnosticItemRepository,
            UserRepository userRepository,
            AbilityEstimator abilityEstimator,
            ItemCalibrator itemCalibrator,
            ObjectMapper objectMapper
    ) {
        this.diagnosticAttemptRepository = diagnosticAttemptRepository;
        this.diagnosticItemRepository = diagnosticItemRepository;
        this.userRepository = userRepository;
        this.abilityEstimator = abilityEstimator;
        this.itemCalibrator = itemCalibrator;
        this.objectMapper = objectMapper;
    }

    public EapEstimate updateAbilityFromAttempt(Long userId, DiagnosticAttempt attempt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<DiagnosticItem> items = diagnosticItemRepository.findAllByOrderByIdAsc();
        Map<Long, ItemParams> itemParams = buildItemParams(items);
        List<Response> responses = mapResponses(attempt, items);
        EapEstimate estimate = abilityEstimator.estimateTheta(responses, itemParams);

        user.setAbilityTheta(estimate.theta());
        user.setAbilityStandardError(estimate.standardError());
        user.setLastAbilityUpdate(Instant.now());
        userRepository.save(user);
        return estimate;
    }

    public CalibrationRunResponse runCalibrationCycle() {
        long startedAt = System.currentTimeMillis();
        List<DiagnosticAttempt> attempts = diagnosticAttemptRepository.findByCompletedAtIsNotNullOrderByIdAsc();
        List<DiagnosticItem> items = diagnosticItemRepository.findAllByOrderByIdAsc();
        Map<Long, List<Response>> responsesByUser = new LinkedHashMap<>();
        Map<Long, Integer> responseCounts = initializeResponseCounts(items);

        for (DiagnosticAttempt attempt : attempts) {
            List<Response> responses = mapResponses(attempt, items);
            if (!responses.isEmpty()) {
                responsesByUser.put(attempt.getId(), responses);
                for (Response response : responses) {
                    responseCounts.merge(response.itemId(), 1, Integer::sum);
                }
            }
        }

        Map<Long, ItemParams> calibrated = itemCalibrator.calibrateItems(responsesByUser);
        Instant calibratedAt = Instant.now();
        int itemsCalibrated = 0;
        int itemsConverged = 0;

        for (DiagnosticItem item : items) {
            Integer count = responseCounts.getOrDefault(item.getId(), 0);
            item.setResponseCount(count);
            item.setDiscrimination(1.0d);
            item.setCalibrationStatus(resolveStatus(count));
            if (count >= MIN_RESPONSES_FOR_ESTIMATION && calibrated.containsKey(item.getId())) {
                item.setDifficulty(calibrated.get(item.getId()).difficulty());
                item.setLastCalibratedAt(calibratedAt);
                itemsCalibrated++;
            }
            if (count >= MIN_RESPONSES_FOR_CONVERGENCE) {
                itemsConverged++;
            }
        }

        diagnosticItemRepository.saveAll(items);
        return new CalibrationRunResponse(
                itemsCalibrated,
                itemsConverged,
                System.currentTimeMillis() - startedAt,
                calibratedAt
        );
    }

    @Transactional(readOnly = true)
    public CalibrationStatsResponse getStats() {
        List<DiagnosticItem> items = diagnosticItemRepository.findAll();
        Map<CalibrationStatus, Long> byStatus = new EnumMap<>(CalibrationStatus.class);
        for (CalibrationStatus status : CalibrationStatus.values()) {
            byStatus.put(status, 0L);
        }
        for (DiagnosticItem item : items) {
            CalibrationStatus status = item.getCalibrationStatus() == null
                    ? CalibrationStatus.UNCALIBRATED
                    : item.getCalibrationStatus();
            byStatus.merge(status, 1L, Long::sum);
        }

        Double avgDifficulty = average(items.stream()
                .map(DiagnosticItem::getDifficulty)
                .filter(value -> value != null)
                .toList());
        Double avgDiscrimination = average(items.stream()
                .map(DiagnosticItem::getDiscrimination)
                .filter(value -> value != null)
                .toList());
        Double avgAbilityTheta = average(userRepository.findAll().stream()
                .map(User::getAbilityTheta)
                .filter(value -> value != null)
                .toList());
        Instant lastCalibrationAt = items.stream()
                .map(DiagnosticItem::getLastCalibratedAt)
                .filter(value -> value != null)
                .max(Instant::compareTo)
                .orElse(null);
        long totalResponses = items.stream()
                .map(DiagnosticItem::getResponseCount)
                .filter(value -> value != null)
                .mapToLong(Integer::longValue)
                .sum();

        return new CalibrationStatsResponse(
                items.size(),
                byStatus,
                avgDifficulty,
                avgDiscrimination,
                avgAbilityTheta,
                lastCalibrationAt,
                totalResponses
        );
    }

    @Transactional(readOnly = true)
    public List<CalibratedItemResponse> getItems() {
        return diagnosticItemRepository.findAllByOrderByIdAsc().stream()
                .map(item -> new CalibratedItemResponse(
                        item.getId(),
                        preview(item.getQuestionText()),
                        item.getCefrLevel(),
                        item.getDifficulty(),
                        item.getDiscrimination(),
                        item.getResponseCount(),
                        item.getCalibrationStatus() == null ? CalibrationStatus.UNCALIBRATED : item.getCalibrationStatus()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public UserAbilityResponse getUserAbility(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return new UserAbilityResponse(
                user.getId(),
                user.getAbilityTheta(),
                user.getAbilityStandardError(),
                user.getLastAbilityUpdate(),
                predictLevel(user.getAbilityTheta()),
                parseLegacyLevel(user.getEnglishLevel())
        );
    }

    public boolean hasEnoughCalibratedItems() {
        return diagnosticItemRepository.findAll().stream()
                .filter(item -> item.getCalibrationStatus() != null && item.getCalibrationStatus() != CalibrationStatus.UNCALIBRATED)
                .count() >= 5;
    }

    public CefrLevel predictLevel(Double theta) {
        if (theta == null) {
            return null;
        }
        if (theta < -1.0d) {
            return CefrLevel.A1;
        }
        if (theta < -0.3d) {
            return CefrLevel.A2;
        }
        if (theta < 0.5d) {
            return CefrLevel.B1;
        }
        if (theta < 1.5d) {
            return CefrLevel.B2;
        }
        return CefrLevel.C1;
    }

    private Map<Long, Integer> initializeResponseCounts(List<DiagnosticItem> items) {
        Map<Long, Integer> counts = new LinkedHashMap<>();
        for (DiagnosticItem item : items) {
            counts.put(item.getId(), 0);
        }
        return counts;
    }

    private Map<Long, ItemParams> buildItemParams(List<DiagnosticItem> items) {
        Map<Long, ItemParams> itemParams = new LinkedHashMap<>();
        for (DiagnosticItem item : items) {
            double difficulty = item.getDifficulty() != null ? item.getDifficulty() : defaultDifficulty(item.getCefrLevel());
            double discrimination = item.getDiscrimination() != null ? item.getDiscrimination() : 1.0d;
            itemParams.put(item.getId(), new ItemParams(difficulty, discrimination));
        }
        return itemParams;
    }

    private List<Response> mapResponses(DiagnosticAttempt attempt, List<DiagnosticItem> items) {
        List<Integer> answers = readResponses(attempt.getResponsesJson());
        int upperBound = Math.min(items.size(), answers.size());
        java.util.ArrayList<Response> responses = new java.util.ArrayList<>();
        for (int index = 0; index < upperBound; index++) {
            Integer answer = answers.get(index);
            if (answer == null) {
                continue;
            }
            DiagnosticItem item = items.get(index);
            responses.add(new Response(item.getId(), answer.equals(item.getCorrectAnswerIdx())));
        }
        return responses;
    }

    private List<Integer> readResponses(String responsesJson) {
        try {
            return objectMapper.readValue(responsesJson, new TypeReference<>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer las respuestas del diagnostico", exception);
        }
    }

    private double defaultDifficulty(CefrLevel cefrLevel) {
        return switch (cefrLevel) {
            case A1 -> -1.5d;
            case A2 -> -0.75d;
            case B1 -> 0.0d;
            case B2 -> 0.85d;
            case C1, C2 -> 1.7d;
        };
    }

    private CalibrationStatus resolveStatus(int responseCount) {
        if (responseCount >= MIN_RESPONSES_FOR_CONVERGENCE) {
            return CalibrationStatus.CONVERGED;
        }
        if (responseCount >= MIN_RESPONSES_FOR_ESTIMATION) {
            return CalibrationStatus.ESTIMATED;
        }
        return CalibrationStatus.UNCALIBRATED;
    }

    private Double average(List<Double> values) {
        if (values.isEmpty()) {
            return null;
        }
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0d);
    }

    private String preview(String questionText) {
        if (questionText == null || questionText.length() <= 90) {
            return questionText;
        }
        return questionText.substring(0, 87) + "...";
    }

    private CefrLevel parseLegacyLevel(String legacyLevel) {
        if (legacyLevel == null || legacyLevel.isBlank()) {
            return null;
        }
        return CefrLevel.valueOf(legacyLevel);
    }
}
