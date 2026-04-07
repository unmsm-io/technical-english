package pe.edu.unmsm.fisi.techeng.task.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskAttempt;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskPhase;

public interface TaskAttemptRepository extends JpaRepository<TaskAttempt, Long> {

    List<TaskAttempt> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<TaskAttempt> findFirstByUserIdAndTaskIdAndPhaseNot(Long userId, Long taskId, TaskPhase phase);

    long countByUserIdAndPhase(Long userId, TaskPhase phase);
}
