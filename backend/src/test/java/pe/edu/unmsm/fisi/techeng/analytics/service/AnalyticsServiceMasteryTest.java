package pe.edu.unmsm.fisi.techeng.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.analytics.dto.AcquisitionRateResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowAlertResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowState;
import pe.edu.unmsm.fisi.techeng.analytics.dto.StabilityHeatmapResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryEntry;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.practice.repository.AttemptRepository;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceMasteryTest {

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private MasteryService masteryService;

    @Mock
    private ReviewCardRepository reviewCardRepository;

    @Mock
    private ReviewLogRepository reviewLogRepository;

    @Mock
    private FlowDetector flowDetector;

    @Mock
    private KcMasteryStateRepository kcMasteryStateRepository;

    @Mock
    private KnowledgeComponentRepository knowledgeComponentRepository;

    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsService(
                attemptRepository,
                userRepository,
                vocabularyRepository,
                masteryService,
                reviewCardRepository,
                reviewLogRepository,
                flowDetector,
                kcMasteryStateRepository,
                knowledgeComponentRepository
        );
    }

    @Test
    void shouldProxyStudentMasteryRadar() {
        MasteryRadarResponse radar = new MasteryRadarResponse(
                1L,
                List.of(new KcMasteryEntry(1L, "passive_voice", "Voz pasiva", KcCategory.GRAMMAR, 0.8, 3, 2, null)),
                0,
                1,
                Instant.now()
        );
        when(masteryService.getMasteryRadar(1L)).thenReturn(radar);

        assertThat(analyticsService.getStudentMasteryRadar(1L)).isEqualTo(radar);
    }

    @Test
    void shouldBuildStabilityHeatmapAndAcquisition() {
        ReviewCard first = new ReviewCard();
        first.setUserId(1L);
        first.setState(CardState.LEARNING);
        first.setStability(0.5);
        ReviewCard second = new ReviewCard();
        second.setUserId(1L);
        second.setState(CardState.REVIEW);
        second.setStability(12.0);

        ReviewLog reviewLog = new ReviewLog();
        reviewLog.setCardId(10L);
        reviewLog.setGrade(ReviewGrade.GOOD);
        reviewLog.setReviewedAt(Instant.now());

        when(reviewCardRepository.findByUserId(1L)).thenReturn(List.of(first, second));
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(reviewLog));

        StabilityHeatmapResponse heatmap = analyticsService.getStudentStabilityHeatmap(1L);
        AcquisitionRateResponse acquisition = analyticsService.getVocabularyAcquisitionRate(1L);

        assertThat(heatmap.buckets()).extracting(StabilityHeatmapResponse.Bucket::count).contains(1L, 1L);
        assertThat(acquisition.points()).hasSize(8);
    }

    @Test
    void shouldExposeFlowAndCohortAggregates() {
        FlowState flowState = new FlowState("FLOW", "msg", "rec", Instant.now(), 0.75, 4, 0, 0);
        when(flowDetector.detect(1L)).thenReturn(flowState);

        KnowledgeComponent kc = new KnowledgeComponent();
        kc.setId(9L);
        kc.setName("passive_voice");
        kc.setNameEs("Voz pasiva");
        kc.setCategory(KcCategory.GRAMMAR);
        kc.setCefrLevel(CefrLevel.A2);
        kc.setActive(true);

        KcMasteryState state = new KcMasteryState();
        state.setUserId(1L);
        state.setKcId(9L);
        state.setPLearned(0.96);

        User user = new User();
        user.setId(1L);

        when(knowledgeComponentRepository.findAll()).thenReturn(List.of(kc));
        when(kcMasteryStateRepository.findAll()).thenReturn(List.of(state));
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userRepository.countByActiveTrue()).thenReturn(1L);
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        FlowAlertResponse flowAlert = analyticsService.getFlowAlert(1L);

        assertThat(flowAlert.flowState().state()).isEqualTo("FLOW");
        assertThat(analyticsService.getCohortMastery().distributions()).hasSize(1);
        assertThat(analyticsService.getCohortAcquisition().userCount()).isEqualTo(1);
    }
}
