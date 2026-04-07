package pe.edu.unmsm.fisi.techeng.kc.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;

public interface KcResponseLogRepository extends JpaRepository<KcResponseLog, Long> {

    List<KcResponseLog> findByUserIdOrderByRespondedAtAsc(Long userId);

    List<KcResponseLog> findByUserIdOrderByRespondedAtDesc(Long userId, Pageable pageable);

    List<KcResponseLog> findByUserIdAndKcIdOrderByRespondedAtDesc(Long userId, Long kcId, Pageable pageable);

    List<KcResponseLog> findByKcIdAndRespondedAtAfter(Long kcId, Instant since);
}
