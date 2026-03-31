package pe.edu.unmsm.fisi.techeng.practice.repository;

import pe.edu.unmsm.fisi.techeng.practice.entity.Exercise;
import pe.edu.unmsm.fisi.techeng.practice.entity.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByLessonIdAndActiveTrue(Long lessonId);

    List<Exercise> findByLessonIdAndTypeAndActiveTrue(Long lessonId, ExerciseType type);
}
