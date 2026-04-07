package pe.edu.unmsm.fisi.techeng.vocabulary.repository;

import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;

public interface VocabularyRepository extends JpaRepository<VocabularyItem, Long> {

    @Query("""
            select v
            from VocabularyItem v
            where (:layer is null or v.layer = :layer)
              and (:cefrLevel is null or v.cefrLevel = :cefrLevel)
              and (
                   cast(:query as string) is null
                   or lower(v.term) like lower(concat('%', cast(:query as string), '%'))
                   or lower(v.definition) like lower(concat('%', cast(:query as string), '%'))
              )
            """)
    Page<VocabularyItem> search(
            @Param("layer") VocabularyLayer layer,
            @Param("cefrLevel") CefrLevel cefrLevel,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
            select v
            from VocabularyItem v
            where lower(v.term) in :terms
            """)
    List<VocabularyItem> findByNormalizedTerms(@Param("terms") Collection<String> terms);

    long countByLayer(VocabularyLayer layer);
}
