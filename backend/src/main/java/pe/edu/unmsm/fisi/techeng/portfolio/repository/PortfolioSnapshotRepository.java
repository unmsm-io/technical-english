package pe.edu.unmsm.fisi.techeng.portfolio.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.portfolio.entity.PortfolioSnapshot;

public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {

    Optional<PortfolioSnapshot> findTopByUserIdOrderByComputedAtDesc(Long userId);

    Optional<PortfolioSnapshot> findTopByUserIdOrderByComputedAtAsc(Long userId);

    List<PortfolioSnapshot> findByUserIdAndComputedAtAfterOrderByComputedAtAsc(Long userId, Instant computedAt);

    List<PortfolioSnapshot> findByUserIdOrderByComputedAtAsc(Long userId);
}
