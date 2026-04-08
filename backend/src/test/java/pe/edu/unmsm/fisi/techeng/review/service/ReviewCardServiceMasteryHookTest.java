package pe.edu.unmsm.fisi.techeng.review.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.mapper.ReviewMapper;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.mapper.VocabularyMapper;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@ExtendWith(MockitoExtension.class)
class ReviewCardServiceMasteryHookTest {

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
    void gradeCardShouldFeedMasteryUsingGoodAndEasyAsCorrect() {
        ReviewCard card = new ReviewCard();
        card.setId(7L);
        card.setUserId(3L);
        card.setVocabularyItemId(99L);
        card.setState(CardState.NEW);
        card.setRetentionTier(RetentionTier.GENERAL);
        card.setDue(Instant.now());

        VocabularyItem item = new VocabularyItem();
        item.setId(99L);
        item.setTerm("framework");
        item.setDefinition("definition");
        item.setCefrLevel(CefrLevel.A2);
        item.setLayer(VocabularyLayer.AWL);
        item.setFrequency(10);
        item.setPartOfSpeech("noun");
        item.setExampleSentence("Example");

        when(reviewCardRepository.findById(7L)).thenReturn(Optional.of(card));
        when(reviewCardRepository.save(any(ReviewCard.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reviewLogRepository.save(any(ReviewLog.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(vocabularyRepository.findById(99L)).thenReturn(Optional.of(item));

        reviewCardService.gradeCard(7L, ReviewGrade.EASY);

        verify(masteryService).recordResponse(3L, KcItemType.VOCABULARY, 99L, true);
    }
}
