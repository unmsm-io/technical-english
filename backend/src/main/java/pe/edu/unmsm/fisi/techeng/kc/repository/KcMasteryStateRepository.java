package pe.edu.unmsm.fisi.techeng.kc.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;

public interface KcMasteryStateRepository extends JpaRepository<KcMasteryState, Long> {

    Optional<KcMasteryState> findByUserIdAndKcId(Long userId, Long kcId);

    List<KcMasteryState> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    @Query("""
            select state
            from KcMasteryState state
            where state.userId = :userId
              and state.pLearned >= :threshold
            """)
    List<KcMasteryState> findMasteredByUserId(
            @Param("userId") Long userId,
            @Param("threshold") Double threshold
    );
}
