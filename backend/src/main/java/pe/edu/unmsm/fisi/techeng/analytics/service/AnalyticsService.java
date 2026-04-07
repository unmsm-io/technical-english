package pe.edu.unmsm.fisi.techeng.analytics.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import pe.edu.unmsm.fisi.techeng.analytics.dto.AcquisitionRateResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.CohortAcquisitionResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.CohortMasteryResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.DashboardStatsResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowAlertResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowState;
import pe.edu.unmsm.fisi.techeng.analytics.dto.StabilityHeatmapResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.UserStatsResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.practice.repository.AttemptRepository;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final MasteryService masteryService;
    private final ReviewCardRepository reviewCardRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final FlowDetector flowDetector;
    private final KcMasteryStateRepository kcMasteryStateRepository;
    private final KnowledgeComponentRepository knowledgeComponentRepository;

    public UserStatsResponse getUserStats(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        long total = attemptRepository.countByUserId(userId);
        long correct = attemptRepository.countByUserIdAndCorrectTrue(userId);
        Double avg = attemptRepository.averageScoreByUser(userId);
        double accuracy = total > 0 ? (double) correct / total * 100 : 0;

        return new UserStatsResponse(userId, total, correct, avg, accuracy);
    }

    public DashboardStatsResponse getDashboardStats() {
        LinkedHashMap<String, Long> vocabularyByLayer = new LinkedHashMap<>();
        for (VocabularyLayer layer : VocabularyLayer.values()) {
            vocabularyByLayer.put(layer.name(), vocabularyRepository.countByLayer(layer));
        }

        return new DashboardStatsResponse(
                userRepository.countByActiveTrue(),
                userRepository.countByDiagnosticCompletedTrue(),
                userRepository.averageVocabularySize(),
                vocabularyByLayer
        );
    }

    public MasteryRadarResponse getStudentMasteryRadar(Long userId) {
        return masteryService.getMasteryRadar(userId);
    }

    public StabilityHeatmapResponse getStudentStabilityHeatmap(Long userId) {
        List<pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard> cards = reviewCardRepository.findByUserId(userId);
        return new StabilityHeatmapResponse(
                userId,
                List.of(
                        bucket("0-1d", cards.stream().filter(card -> card.getStability() < 1).count()),
                        bucket("1-7d", cards.stream().filter(card -> card.getStability() >= 1 && card.getStability() < 7).count()),
                        bucket("7-30d", cards.stream().filter(card -> card.getStability() >= 7 && card.getStability() < 30).count()),
                        bucket("30-90d", cards.stream().filter(card -> card.getStability() >= 30 && card.getStability() < 90).count()),
                        bucket("90+d", cards.stream().filter(card -> card.getStability() >= 90).count())
                )
        );
    }

    public AcquisitionRateResponse getVocabularyAcquisitionRate(Long userId) {
        return new AcquisitionRateResponse(userId, buildWeeklyAcquisitionPoints(userId));
    }

    public FlowAlertResponse getFlowAlert(Long userId) {
        FlowState flowState = flowDetector.detect(userId);
        return new FlowAlertResponse(userId, flowState);
    }

    public CohortMasteryResponse getCohortMastery() {
        List<KnowledgeComponent> kcs = knowledgeComponentRepository.findAll().stream()
                .filter(KnowledgeComponent::isActive)
                .toList();
        List<KcMasteryState> states = kcMasteryStateRepository.findAll();

        List<CohortMasteryResponse.KcDistribution> distributions = kcs.stream()
                .map(kc -> {
                    List<KcMasteryState> byKc = states.stream().filter(state -> state.getKcId().equals(kc.getId())).toList();
                    return new CohortMasteryResponse.KcDistribution(
                            kc.getId(),
                            kc.getName(),
                            kc.getNameEs(),
                            byKc.stream().filter(state -> state.getPLearned() < 0.4).count(),
                            byKc.stream().filter(state -> state.getPLearned() >= 0.4 && state.getPLearned() < 0.7).count(),
                            byKc.stream().filter(state -> state.getPLearned() >= 0.7 && state.getPLearned() < MasteryService.MASTERY_THRESHOLD).count(),
                            byKc.stream().filter(state -> state.getPLearned() >= MasteryService.MASTERY_THRESHOLD).count()
                    );
                })
                .toList();

        return new CohortMasteryResponse(userRepository.countByActiveTrue(), distributions);
    }

    public CohortAcquisitionResponse getCohortAcquisition() {
        List<Long> userIds = userRepository.findAll().stream().map(pe.edu.unmsm.fisi.techeng.user.entity.User::getId).toList();
        Map<String, Long> totals = new LinkedHashMap<>();
        for (Long userId : userIds) {
            for (AcquisitionRateResponse.WeekPoint point : buildWeeklyAcquisitionPoints(userId)) {
                totals.merge(point.week(), point.count(), Long::sum);
            }
        }

        List<CohortAcquisitionResponse.WeekAggregate> points = totals.entrySet().stream()
                .map(entry -> new CohortAcquisitionResponse.WeekAggregate(
                        entry.getKey(),
                        userIds.isEmpty() ? 0.0 : Math.round((entry.getValue() * 100.0 / userIds.size())) / 100.0,
                        entry.getValue()
                ))
                .toList();

        return new CohortAcquisitionResponse(userIds.size(), points);
    }

    private List<AcquisitionRateResponse.WeekPoint> buildWeeklyAcquisitionPoints(Long userId) {
        Instant since = Instant.now().minus(56, ChronoUnit.DAYS);
        Map<String, Long> firstSuccessfulByWeek = reviewLogRepository.findReviewedSince(userId, since).stream()
                .filter(log -> log.getGrade() != ReviewGrade.AGAIN)
                .collect(Collectors.groupingBy(
                        log -> log.getReviewedAt().atZone(ZoneOffset.UTC).toLocalDate().with(java.time.DayOfWeek.MONDAY).toString(),
                        LinkedHashMap::new,
                        Collectors.mapping(ReviewLog::getCardId, Collectors.collectingAndThen(Collectors.toSet(), set -> (long) set.size()))
                ));

        LinkedHashMap<String, Long> ordered = new LinkedHashMap<>();
        LocalDate startWeek = LocalDate.now(ZoneOffset.UTC).with(java.time.DayOfWeek.MONDAY).minusWeeks(7);
        for (int index = 0; index < 8; index++) {
            String week = startWeek.plusWeeks(index).toString();
            ordered.put(week, firstSuccessfulByWeek.getOrDefault(week, 0L));
        }

        return ordered.entrySet().stream()
                .map(entry -> new AcquisitionRateResponse.WeekPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private StabilityHeatmapResponse.Bucket bucket(String label, long count) {
        return new StabilityHeatmapResponse.Bucket(label, count);
    }
}
