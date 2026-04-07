package pe.edu.unmsm.fisi.techeng.verification.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.verification.entity.VerificationLog;

public interface VerificationLogRepository extends JpaRepository<VerificationLog, Long> {

    List<VerificationLog> findByGeneratedItemIdOrderByCreatedAtAsc(Long generatedItemId);
}
