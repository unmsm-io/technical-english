package pe.edu.unmsm.fisi.techeng.pilot.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotCohort;

public interface PilotCohortRepository extends JpaRepository<PilotCohort, Long> {

    List<PilotCohort> findAllByOrderByCreatedAtDesc();
}
