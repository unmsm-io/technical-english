package pe.edu.unmsm.fisi.techeng.portfolio.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.PortfolioSnapshot;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.SnapshotType;
import pe.edu.unmsm.fisi.techeng.portfolio.mapper.PortfolioMapper;
import pe.edu.unmsm.fisi.techeng.portfolio.repository.PortfolioSnapshotRepository;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioService {

    private static final long CACHE_HOURS = 24L;

    private final PortfolioSnapshotRepository portfolioSnapshotRepository;
    private final TaskAttemptRepository taskAttemptRepository;
    private final TaskRepository taskRepository;
    private final ReviewCardRepository reviewCardRepository;
    private final KcMasteryStateRepository kcMasteryStateRepository;
    private final SummativeAttemptRepository summativeAttemptRepository;
    private final UserRepository userRepository;
    private final PortfolioGrowthAnalyzer portfolioGrowthAnalyzer;
    private final PortfolioMapper portfolioMapper;
    private final ObjectMapper objectMapper;

    public PortfolioDtos.PortfolioResponse getCurrentPortfolio(Long userId) {
        PortfolioSnapshot snapshot = portfolioSnapshotRepository.findTopByUserIdOrderByComputedAtDesc(userId)
                .filter(existing -> existing.getComputedAt().isAfter(Instant.now().minusSeconds(CACHE_HOURS * 3600)))
                .orElseGet(() -> recomputeOneInternal(userId, SnapshotType.ON_DEMAND));

        return portfolioMapper.toPortfolioResponse(
                snapshot,
                readHighlights(snapshot),
                recentTimelineEntries(userId)
        );
    }

    @Transactional(readOnly = true)
    public PortfolioDtos.PortfolioTimelineResponse getTimeline(Long userId) {
        return new PortfolioDtos.PortfolioTimelineResponse(userId, buildTimelineEntries(userId));
    }

    @Transactional(readOnly = true)
    public List<PortfolioDtos.PortfolioSnapshotResponse> getHistory(Long userId, int weeks) {
        Instant since = Instant.now().minusSeconds(Math.max(weeks, 1) * 7L * 24L * 3600L);
        return portfolioSnapshotRepository.findByUserIdAndComputedAtAfterOrderByComputedAtAsc(userId, since).stream()
                .map(portfolioMapper::toSnapshotResponse)
                .toList();
    }

    public List<PortfolioDtos.PortfolioSnapshotResponse> recomputeAll() {
        return userRepository.findByActiveTrue(PageRequest.of(0, 500)).stream()
                .map(user -> portfolioMapper.toSnapshotResponse(recomputeOneInternal(user.getId(), SnapshotType.WEEKLY)))
                .toList();
    }

    public PortfolioDtos.PortfolioResponse recomputeOne(Long userId) {
        PortfolioSnapshot snapshot = recomputeOneInternal(userId, SnapshotType.ON_DEMAND);
        return portfolioMapper.toPortfolioResponse(
                snapshot,
                readHighlights(snapshot),
                recentTimelineEntries(userId)
        );
    }

    private PortfolioSnapshot recomputeOneInternal(Long userId, SnapshotType snapshotType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<TaskAttempt> attempts = taskAttemptRepository.findByUserIdOrderByStartedAtDesc(userId);
        int tasksCompleted = (int) attempts.stream()
                .filter(attempt -> attempt.getPhase() == TaskPhase.COMPLETED)
                .count();
        int tasksWithRewrite = (int) attempts.stream()
                .filter(attempt -> attempt.getRewriteAnswerEn() != null && !attempt.getRewriteAnswerEn().isBlank())
                .count();
        long acceptedRewrites = attempts.stream()
                .filter(attempt -> Boolean.TRUE.equals(attempt.getRewriteAccepted()))
                .count();
        double rewriteAcceptanceRate = tasksWithRewrite == 0 ? 0.0 : acceptedRewrites / (double) tasksWithRewrite;

        int vocabularySize = (int) reviewCardRepository.findByUserId(userId).stream()
                .filter(card -> card.getState() != CardState.NEW)
                .count();
        int vocabularyGrowthLast30d = (int) reviewCardRepository.findByUserId(userId).stream()
                .filter(card -> card.getLastReview() != null && card.getLastReview().isAfter(Instant.now().minusSeconds(30L * 24L * 3600L)))
                .count();

        int kcMasteredCount = kcMasteryStateRepository.findMasteredByUserId(userId, 0.95).size();
        List<pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt> summativeAttempts =
                summativeAttemptRepository.findByUserIdOrderByStartedAtDesc(userId);
        int summativeTestsPassed = (int) summativeAttempts.stream()
                .filter(attempt -> Boolean.TRUE.equals(attempt.getPassed()))
                .count();
        double summativeAvgScore = summativeAttempts.stream()
                .filter(attempt -> attempt.getOverallScore() != null)
                .mapToInt(pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt::getOverallScore)
                .average()
                .orElse(0.0);

        List<PortfolioDtos.GrowthHighlight> highlights = portfolioGrowthAnalyzer.analyze(
                attempts.stream()
                        .filter(attempt -> attempt.getUserAnswerEn() != null && !attempt.getUserAnswerEn().isBlank())
                        .map(attempt -> taskRepository.findById(attempt.getTaskId())
                                .map(task -> new PortfolioGrowthAnalyzer.PortfolioGrowthSample(
                                        task.getTaskType(),
                                        attempt.getStartedAt(),
                                        attempt.getUserAnswerEn()
                                ))
                                .orElse(null))
                        .filter(java.util.Objects::nonNull)
                        .toList()
        );

        Double firstAbility = portfolioSnapshotRepository.findTopByUserIdOrderByComputedAtAsc(userId)
                .map(PortfolioSnapshot::getAbilityTheta)
                .orElse(user.getAbilityTheta());
        double abilityComparisonToFirst =
                user.getAbilityTheta() == null || firstAbility == null ? 0.0 : user.getAbilityTheta() - firstAbility;

        PortfolioSnapshot snapshot = new PortfolioSnapshot();
        snapshot.setUserId(userId);
        snapshot.setSnapshotType(snapshotType);
        snapshot.setTasksCompleted(tasksCompleted);
        snapshot.setTasksWithRewrite(tasksWithRewrite);
        snapshot.setRewriteAcceptanceRate(round(rewriteAcceptanceRate));
        snapshot.setVocabularySize(vocabularySize);
        snapshot.setVocabularyGrowthLast30d(vocabularyGrowthLast30d);
        snapshot.setKcMasteredCount(kcMasteredCount);
        snapshot.setSummativeTestsPassed(summativeTestsPassed);
        snapshot.setSummativeAvgScore(round(summativeAvgScore));
        snapshot.setAbilityTheta(user.getAbilityTheta());
        snapshot.setAbilityComparisonToFirst(round(abilityComparisonToFirst));
        snapshot.setGrowthHighlightsJson(writeHighlights(highlights));
        snapshot.setComputedAt(Instant.now());
        return portfolioSnapshotRepository.save(snapshot);
    }

    private List<PortfolioDtos.PortfolioTimelineEntry> recentTimelineEntries(Long userId) {
        List<PortfolioDtos.PortfolioTimelineEntry> timeline = buildTimelineEntries(userId);
        return timeline.stream().limit(8).toList();
    }

    private List<PortfolioDtos.PortfolioTimelineEntry> buildTimelineEntries(Long userId) {
        List<PortfolioDtos.PortfolioTimelineEntry> entries = new ArrayList<>();

        for (TaskAttempt attempt : taskAttemptRepository.findByUserIdOrderByStartedAtDesc(userId)) {
            String title = taskRepository.findById(attempt.getTaskId())
                    .map(task -> task.getTitleEs())
                    .orElse("Tarea");
            String snippet = attempt.getUserAnswerEn() == null ? "" : attempt.getUserAnswerEn();
            entries.add(new PortfolioDtos.PortfolioTimelineEntry(
                    "TASK",
                    attempt.getStartedAt().atZone(ZoneId.systemDefault()).toInstant(),
                    title,
                    attempt.getScore(),
                    snippet.length() > 120 ? snippet.substring(0, 120) + "..." : snippet
            ));
        }

        for (pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt attempt : summativeAttemptRepository.findByUserIdOrderByStartedAtDesc(userId)) {
            entries.add(new PortfolioDtos.PortfolioTimelineEntry(
                    "SUMMATIVE",
                    attempt.getStartedAt().atZone(ZoneId.systemDefault()).toInstant(),
                    "Prueba final " + attempt.getSummativeTestId(),
                    attempt.getOverallScore(),
                    attempt.getProductionAnswerEn() == null ? "" : attempt.getProductionAnswerEn()
            ));
        }

        return entries.stream()
                .sorted(Comparator.comparing(PortfolioDtos.PortfolioTimelineEntry::date).reversed())
                .toList();
    }

    private List<PortfolioDtos.GrowthHighlight> readHighlights(PortfolioSnapshot snapshot) {
        try {
            return objectMapper.readValue(snapshot.getGrowthHighlightsJson(), new TypeReference<>() {});
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer los highlights del portafolio", exception);
        }
    }

    private String writeHighlights(List<PortfolioDtos.GrowthHighlight> highlights) {
        try {
            return objectMapper.writeValueAsString(highlights);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo guardar los highlights del portafolio", exception);
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
