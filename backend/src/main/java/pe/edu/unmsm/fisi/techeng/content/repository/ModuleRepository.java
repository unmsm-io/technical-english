package pe.edu.unmsm.fisi.techeng.content.repository;

import pe.edu.unmsm.fisi.techeng.content.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findByActiveTrueOrderByDisplayOrderAsc();

    List<Module> findByLevelAndActiveTrueOrderByDisplayOrderAsc(String level);
}
