package pe.edu.unmsm.fisi.techeng.kc.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public interface KnowledgeComponentRepository extends JpaRepository<KnowledgeComponent, Long> {

    Optional<KnowledgeComponent> findByName(String name);

    @Query("""
            select kc
            from KnowledgeComponent kc
            where (:category is null or kc.category = :category)
              and (:level is null or kc.cefrLevel = :level)
              and (
                   cast(:query as string) is null
                   or lower(kc.name) like lower(concat('%', cast(:query as string), '%'))
                   or lower(kc.nameEs) like lower(concat('%', cast(:query as string), '%'))
                   or lower(kc.description) like lower(concat('%', cast(:query as string), '%'))
              )
            """)
    Page<KnowledgeComponent> search(
            @Param("category") KcCategory category,
            @Param("level") CefrLevel level,
            @Param("query") String query,
            Pageable pageable
    );
}
