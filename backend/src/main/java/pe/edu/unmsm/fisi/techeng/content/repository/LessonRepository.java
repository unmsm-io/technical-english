package pe.edu.unmsm.fisi.techeng.content.repository;

import pe.edu.unmsm.fisi.techeng.content.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModuleIdAndActiveTrueOrderByDisplayOrderAsc(Long moduleId);
}
