package pe.edu.unmsm.fisi.techeng.pilot.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.pilot.entity.PilotEnrollment;

public interface PilotEnrollmentRepository extends JpaRepository<PilotEnrollment, Long> {

    List<PilotEnrollment> findByCohortIdOrderByEnrolledAtAsc(Long cohortId);

    Optional<PilotEnrollment> findByCohortIdAndUserId(Long cohortId, Long userId);

    List<PilotEnrollment> findByUserId(Long userId);
}
