package pe.edu.unmsm.fisi.techeng.task.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
            select t
            from Task t
            where t.active = true
              and (:type is null or t.taskType = :type)
              and (:cefrLevel is null or t.cefrLevel = :cefrLevel)
              and (
                   cast(:query as string) is null
                   or lower(t.titleEs) like lower(concat('%', cast(:query as string), '%'))
                   or lower(t.descriptionEs) like lower(concat('%', cast(:query as string), '%'))
              )
            """)
    Page<Task> search(
            @Param("type") TaskType type,
            @Param("cefrLevel") CefrLevel cefrLevel,
            @Param("query") String query,
            Pageable pageable
    );

    Optional<Task> findByIdAndActiveTrue(Long id);

    long countByTaskType(TaskType taskType);

    long countByCefrLevel(CefrLevel cefrLevel);
}
