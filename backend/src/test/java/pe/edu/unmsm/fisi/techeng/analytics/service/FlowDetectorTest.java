package pe.edu.unmsm.fisi.techeng.analytics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcResponseLogRepository;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;

@ExtendWith(MockitoExtension.class)
class FlowDetectorTest {

    @Mock
    private ReviewLogRepository reviewLogRepository;

    @Mock
    private KcResponseLogRepository kcResponseLogRepository;

    private FlowDetector flowDetector;

    @BeforeEach
    void setUp() {
        flowDetector = new FlowDetector(reviewLogRepository, kcResponseLogRepository);
    }

    @Test
    void detectShouldReturnFrustration() {
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(review(ReviewGrade.AGAIN), review(ReviewGrade.AGAIN), review(ReviewGrade.AGAIN)));
        when(kcResponseLogRepository.findByUserIdAndRespondedAtAfter(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        assertThat(flowDetector.detect(1L).state()).isEqualTo("FRUSTRATION");
    }

    @Test
    void detectShouldReturnBoredom() {
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(java.util.stream.IntStream.range(0, 10).mapToObj(index -> review(ReviewGrade.EASY)).toList());
        when(kcResponseLogRepository.findByUserIdAndRespondedAtAfter(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        assertThat(flowDetector.detect(1L).state()).isEqualTo("BOREDOM");
    }

    @Test
    void detectShouldReturnFlow() {
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(review(ReviewGrade.GOOD), review(ReviewGrade.GOOD)));
        when(kcResponseLogRepository.findByUserIdAndRespondedAtAfter(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(kcLog(true), kcLog(false)));

        assertThat(flowDetector.detect(1L).state()).isEqualTo("FLOW");
    }

    @Test
    void detectShouldReturnInactive() {
        when(reviewLogRepository.findReviewedSince(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(kcResponseLogRepository.findByUserIdAndRespondedAtAfter(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        assertThat(flowDetector.detect(1L).state()).isEqualTo("INACTIVE");
    }

    private ReviewLog review(ReviewGrade grade) {
        ReviewLog reviewLog = new ReviewLog();
        reviewLog.setGrade(grade);
        reviewLog.setReviewedAt(Instant.now());
        return reviewLog;
    }

    private KcResponseLog kcLog(boolean correct) {
        KcResponseLog log = new KcResponseLog();
        log.setCorrect(correct);
        log.setRespondedAt(Instant.now());
        return log;
    }
}
