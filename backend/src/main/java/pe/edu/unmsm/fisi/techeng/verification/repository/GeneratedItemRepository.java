package pe.edu.unmsm.fisi.techeng.verification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;

public interface GeneratedItemRepository extends JpaRepository<GeneratedItem, Long> {

    Page<GeneratedItem> findByStateOrderByCreatedAtDesc(GeneratedItemState state, Pageable pageable);

    Page<GeneratedItem> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByState(GeneratedItemState state);
}
