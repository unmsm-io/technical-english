package pe.edu.unmsm.fisi.techeng.review.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewBootstrapResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardResponse;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.mapper.ReviewMapper;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.mapper.VocabularyMapper;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@ExtendWith(MockitoExtension.class)
class ReviewCardServiceTest {

    @Mock
    private ReviewCardRepository reviewCardRepository;

    @Mock
    private ReviewLogRepository reviewLogRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MasteryService masteryService;

    private ReviewCardService reviewCardService;

    @BeforeEach
    void setUp() {
        reviewCardService = new ReviewCardService(
                reviewCardRepository,
                reviewLogRepository,
                vocabularyRepository,
                new VocabularyMapper(),
                new ReviewMapper(),
                new FsrsScheduler(),
                userRepository,
                masteryService
        );
    }

    @Test
    void bootstrapForUser_shouldSkipWhenDeckAlreadyExists() {
        when(reviewCardRepository.existsByUserId(1L)).thenReturn(true);

        ReviewBootstrapResponse response = reviewCardService.bootstrapForUser(1L, CefrLevel.B1);

        assertThat(response.cardsCreated()).isZero();
        verify(vocabularyRepository, never()).findAll();
        verify(reviewCardRepository, never()).saveAll(any());
    }

    @Test
    void bootstrapForUser_shouldAssignTierByVocabularyLayer() {
        VocabularyItem general = vocabulary(10L, VocabularyLayer.GSL, CefrLevel.A1);
        VocabularyItem technical = vocabulary(11L, VocabularyLayer.CSAWL, CefrLevel.B1);

        when(reviewCardRepository.existsByUserId(2L)).thenReturn(false);
        when(vocabularyRepository.findAll()).thenReturn(List.of(general, technical));
        when(reviewCardRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewBootstrapResponse response = reviewCardService.bootstrapForUser(2L, CefrLevel.B1);

        ArgumentCaptor<List<ReviewCard>> captor = ArgumentCaptor.forClass(List.class);
        verify(reviewCardRepository).saveAll(captor.capture());

        assertThat(response.cardsCreated()).isEqualTo(2);
        assertThat(captor.getValue())
                .extracting(ReviewCard::getRetentionTier)
                .containsExactlyInAnyOrder(RetentionTier.GENERAL, RetentionTier.TECHNICAL_CORE);
    }

    @Test
    void gradeCard_shouldCreateReviewLogAndAdvanceSchedule() {
        ReviewCard card = new ReviewCard();
        card.setId(7L);
        card.setUserId(3L);
        card.setVocabularyItemId(99L);
        card.setStability(0.0);
        card.setDifficulty(0.0);
        card.setElapsedDays(0);
        card.setScheduledDays(0);
        card.setReps(0);
        card.setLapses(0);
        card.setState(CardState.NEW);
        card.setRetentionTier(RetentionTier.GENERAL);
        card.setDue(Instant.now());

        VocabularyItem item = vocabulary(99L, VocabularyLayer.AWL, CefrLevel.A2);

        when(reviewCardRepository.findById(7L)).thenReturn(Optional.of(card));
        when(reviewCardRepository.save(any(ReviewCard.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reviewLogRepository.save(any(ReviewLog.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(vocabularyRepository.findById(99L)).thenReturn(Optional.of(item));

        ReviewCardResponse response = reviewCardService.gradeCard(7L, ReviewGrade.GOOD);

        ArgumentCaptor<ReviewLog> logCaptor = ArgumentCaptor.forClass(ReviewLog.class);
        verify(reviewLogRepository).save(logCaptor.capture());

        assertThat(response.state()).isEqualTo(CardState.LEARNING);
        assertThat(response.reps()).isEqualTo(1);
        assertThat(logCaptor.getValue().getGrade()).isEqualTo(ReviewGrade.GOOD);
        assertThat(logCaptor.getValue().getNewStability()).isEqualTo(2.3065);
    }

    private VocabularyItem vocabulary(Long id, VocabularyLayer layer, CefrLevel level) {
        VocabularyItem item = new VocabularyItem();
        item.setId(id);
        item.setTerm("term-" + id);
        item.setDefinition("definition-" + id);
        item.setCefrLevel(level);
        item.setLayer(layer);
        item.setFrequency(10);
        item.setPartOfSpeech("noun");
        item.setExampleSentence("Example sentence");
        item.setProtectedToken(false);
        return item;
    }
}
