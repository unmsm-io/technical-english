package pe.edu.unmsm.fisi.techeng.summative.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeAttempt;

public interface SummativeAttemptRepository extends JpaRepository<SummativeAttempt, Long> {

    List<SummativeAttempt> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<SummativeAttempt> findByUserIdAndSummativeTestIdAndCompletedAtIsNotNull(Long userId, Long summativeTestId);

    long countByUserIdAndPassed(Long userId, Boolean passed);
}
