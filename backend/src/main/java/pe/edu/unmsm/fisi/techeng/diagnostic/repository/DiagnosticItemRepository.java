package pe.edu.unmsm.fisi.techeng.diagnostic.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;

public interface DiagnosticItemRepository extends JpaRepository<DiagnosticItem, Long> {

    List<DiagnosticItem> findAllByOrderByIdAsc();
}
