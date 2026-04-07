package pe.edu.unmsm.fisi.techeng.diagnostic.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticAttempt;

public interface DiagnosticAttemptRepository extends JpaRepository<DiagnosticAttempt, Long> {

    List<DiagnosticAttempt> findByUserIdOrderByStartedAtDesc(Long userId);

    List<DiagnosticAttempt> findByCompletedAtIsNotNullOrderByIdAsc();

    long countByCompletedAtIsNotNull();
}
