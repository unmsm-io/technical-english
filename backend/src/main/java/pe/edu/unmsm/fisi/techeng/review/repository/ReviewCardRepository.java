package pe.edu.unmsm.fisi.techeng.review.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;

public interface ReviewCardRepository extends JpaRepository<ReviewCard, Long> {

    Optional<ReviewCard> findByUserIdAndVocabularyItemId(Long userId, Long vocabularyItemId);

    boolean existsByUserId(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndState(Long userId, CardState state);

    long countByUserIdAndRetentionTier(Long userId, RetentionTier retentionTier);

    long countByUserIdAndDueLessThanEqual(Long userId, Instant due);

    List<ReviewCard> findTop50ByUserIdAndDueLessThanEqualOrderByDueAsc(Long userId, Instant due);

    List<ReviewCard> findTop10ByUserIdOrderByLapsesDescDueAsc(Long userId);

    @Query("""
            select c
            from ReviewCard c
            join pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem v on v.id = c.vocabularyItemId
            where c.userId = :userId
              and (:state is null or c.state = :state)
              and (:tier is null or c.retentionTier = :tier)
              and (:layer is null or v.layer = :layer)
              and (
                    cast(:query as string) is null
                    or lower(v.term) like lower(concat('%', cast(:query as string), '%'))
                    or lower(v.definition) like lower(concat('%', cast(:query as string), '%'))
              )
            """)
    Page<ReviewCard> searchDeck(
            @Param("userId") Long userId,
            @Param("state") CardState state,
            @Param("tier") RetentionTier tier,
            @Param("layer") VocabularyLayer layer,
            @Param("query") String query,
            Pageable pageable
    );
}
