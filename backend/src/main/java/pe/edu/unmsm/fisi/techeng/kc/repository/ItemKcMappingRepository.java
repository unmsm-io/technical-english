package pe.edu.unmsm.fisi.techeng.kc.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;

public interface ItemKcMappingRepository extends JpaRepository<ItemKcMapping, Long> {

    List<ItemKcMapping> findByItemTypeAndItemId(KcItemType itemType, Long itemId);

    List<ItemKcMapping> findByKcId(Long kcId);
}
