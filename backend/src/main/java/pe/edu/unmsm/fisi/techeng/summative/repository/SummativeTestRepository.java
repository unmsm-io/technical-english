package pe.edu.unmsm.fisi.techeng.summative.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public interface SummativeTestRepository extends JpaRepository<SummativeTest, Long> {

    Optional<SummativeTest> findByTaskTypeAndCefrLevel(TaskType taskType, CefrLevel cefrLevel);

    Optional<SummativeTest> findByIdAndActiveTrue(Long id);

    @Query("""
            select test
            from SummativeTest test
            where test.active = true
              and (:type is null or test.taskType = :type)
              and (:cefrLevel is null or test.cefrLevel = :cefrLevel)
              and (
                    cast(:query as string) is null
                    or lower(test.titleEs) like lower(concat('%', cast(:query as string), '%'))
                    or lower(test.descriptionEs) like lower(concat('%', cast(:query as string), '%'))
              )
            """)
    Page<SummativeTest> search(
            @Param("type") TaskType type,
            @Param("cefrLevel") CefrLevel cefrLevel,
            @Param("query") String query,
            Pageable pageable
    );
}
