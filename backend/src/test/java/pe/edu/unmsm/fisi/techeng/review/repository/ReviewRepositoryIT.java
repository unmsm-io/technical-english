package pe.edu.unmsm.fisi.techeng.review.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@SpringBootTest
@Transactional
class ReviewRepositoryIT {

    @Autowired
    private ReviewCardRepository reviewCardRepository;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Test
    void searchDeck_shouldHandleNullFiltersAndQuery() {
        VocabularyItem item = new VocabularyItem();
        item.setTerm("event loop");
        item.setDefinition("Repository null filter needle");
        item.setCefrLevel(CefrLevel.B1);
        item.setLayer(VocabularyLayer.EEWL);
        item.setFrequency(1);
        item.setPartOfSpeech("noun");
        item.setExampleSentence("The event loop processes callbacks.");
        item.setProtectedToken(false);
        VocabularyItem savedItem = vocabularyRepository.save(item);

        ReviewCard card = new ReviewCard();
        card.setUserId(500L);
        card.setVocabularyItemId(savedItem.getId());
        card.setState(CardState.NEW);
        card.setRetentionTier(RetentionTier.TECHNICAL_CORE);
        card.setDue(Instant.now());
        reviewCardRepository.save(card);

        Page<ReviewCard> page = reviewCardRepository.searchDeck(500L, null, null, null, null, PageRequest.of(0, 10));
        Page<ReviewCard> filtered = reviewCardRepository.searchDeck(500L, null, RetentionTier.TECHNICAL_CORE, VocabularyLayer.EEWL, "needle", PageRequest.of(0, 10));

        assertThat(page.getContent()).extracting(ReviewCard::getVocabularyItemId).contains(savedItem.getId());
        assertThat(filtered.getContent()).extracting(ReviewCard::getVocabularyItemId).contains(savedItem.getId());
    }
}
