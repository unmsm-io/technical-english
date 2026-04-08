package pe.edu.unmsm.fisi.techeng.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.PortfolioSnapshot;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.SnapshotType;
import pe.edu.unmsm.fisi.techeng.portfolio.mapper.PortfolioMapper;
import pe.edu.unmsm.fisi.techeng.portfolio.repository.PortfolioSnapshotRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskAttemptRepository;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;

class PortfolioServiceTest {

    private PortfolioSnapshotRepository portfolioSnapshotRepository;
    private TaskAttemptRepository taskAttemptRepository;
    private TaskRepository taskRepository;
    private ReviewCardRepository reviewCardRepository;
    private KcMasteryStateRepository kcMasteryStateRepository;
    private SummativeAttemptRepository summativeAttemptRepository;
    private UserRepository userRepository;
    private PortfolioGrowthAnalyzer portfolioGrowthAnalyzer;
    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        portfolioSnapshotRepository = mock(PortfolioSnapshotRepository.class);
        taskAttemptRepository = mock(TaskAttemptRepository.class);
        taskRepository = mock(TaskRepository.class);
        reviewCardRepository = mock(ReviewCardRepository.class);
        kcMasteryStateRepository = mock(KcMasteryStateRepository.class);
        summativeAttemptRepository = mock(SummativeAttemptRepository.class);
        userRepository = mock(UserRepository.class);
        portfolioGrowthAnalyzer = mock(PortfolioGrowthAnalyzer.class);
        portfolioService = new PortfolioService(
                portfolioSnapshotRepository,
                taskAttemptRepository,
                taskRepository,
                reviewCardRepository,
                kcMasteryStateRepository,
                summativeAttemptRepository,
                userRepository,
                portfolioGrowthAnalyzer,
                new PortfolioMapper(),
                new ObjectMapper()
        );
    }

    @Test
    void getCurrentPortfolioShouldReuseFreshSnapshot() {
        PortfolioSnapshot snapshot = new PortfolioSnapshot();
        snapshot.setId(1L);
        snapshot.setUserId(8L);
        snapshot.setSnapshotType(SnapshotType.ON_DEMAND);
        snapshot.setTasksCompleted(4);
        snapshot.setTasksWithRewrite(1);
        snapshot.setRewriteAcceptanceRate(1.0);
        snapshot.setVocabularySize(20);
        snapshot.setVocabularyGrowthLast30d(5);
        snapshot.setKcMasteredCount(3);
        snapshot.setSummativeTestsPassed(2);
        snapshot.setSummativeAvgScore(78.5);
        snapshot.setAbilityTheta(0.44);
        snapshot.setAbilityComparisonToFirst(0.12);
        snapshot.setGrowthHighlightsJson("[]");
        snapshot.setComputedAt(Instant.now());

        when(portfolioSnapshotRepository.findTopByUserIdOrderByComputedAtDesc(8L)).thenReturn(Optional.of(snapshot));
        when(taskAttemptRepository.findByUserIdOrderByStartedAtDesc(8L)).thenReturn(List.of());
        when(summativeAttemptRepository.findByUserIdOrderByStartedAtDesc(8L)).thenReturn(List.of());

        PortfolioDtos.PortfolioResponse response = portfolioService.getCurrentPortfolio(8L);

        assertThat(response.tasksCompleted()).isEqualTo(4);
        verify(userRepository, never()).findById(any());
    }

    @Test
    void recomputeOneShouldPersistNewSnapshot() {
        User user = new User();
        user.setId(5L);
        user.setAbilityTheta(0.8);

        when(userRepository.findById(5L)).thenReturn(Optional.of(user));
        when(portfolioSnapshotRepository.findTopByUserIdOrderByComputedAtAsc(5L)).thenReturn(Optional.empty());
        when(taskAttemptRepository.findByUserIdOrderByStartedAtDesc(5L)).thenReturn(List.of());
        when(reviewCardRepository.findByUserId(5L)).thenReturn(List.of());
        when(kcMasteryStateRepository.findMasteredByUserId(5L, 0.95)).thenReturn(List.of());
        when(summativeAttemptRepository.findByUserIdOrderByStartedAtDesc(5L)).thenReturn(List.of());
        when(portfolioGrowthAnalyzer.analyze(List.of())).thenReturn(List.of());
        when(portfolioSnapshotRepository.save(any(PortfolioSnapshot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PortfolioDtos.PortfolioResponse response = portfolioService.recomputeOne(5L);

        assertThat(response.userId()).isEqualTo(5L);
        verify(portfolioSnapshotRepository).save(any(PortfolioSnapshot.class));
    }
}
