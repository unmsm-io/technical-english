package pe.edu.unmsm.fisi.techeng.practice.repository;

import pe.edu.unmsm.fisi.techeng.practice.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Attempt> findByUserIdAndExerciseLessonId(Long userId, Long lessonId);

    @Query("SELECT AVG(a.score) FROM Attempt a WHERE a.user.id = :userId AND a.score IS NOT NULL")
    Double averageScoreByUser(@Param("userId") Long userId);

    long countByUserIdAndCorrectTrue(Long userId);

    long countByUserId(Long userId);
}
