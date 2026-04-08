package pe.edu.unmsm.fisi.techeng.kc.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcStatsResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.mapper.KcMapper;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KcService {

    private final KnowledgeComponentRepository knowledgeComponentRepository;
    private final ItemKcMappingRepository itemKcMappingRepository;
    private final KcMapper kcMapper;

    public Page<KnowledgeComponentResponse> search(
            KcCategory category,
            CefrLevel level,
            String query,
            Pageable pageable
    ) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        return knowledgeComponentRepository.search(category, level, normalizedQuery, pageable)
                .map(kcMapper::toResponse);
    }

    public KnowledgeComponentResponse getById(Long id) {
        return kcMapper.toResponse(getEntityById(id));
    }

    public List<KnowledgeComponentResponse> getByItem(KcItemType itemType, Long itemId) {
        List<ItemKcMapping> mappings = itemKcMappingRepository.findByItemTypeAndItemId(itemType, itemId);
        if (mappings.isEmpty()) {
            return List.of();
        }

        Map<Long, ItemKcMapping> mappingByKcId = new LinkedHashMap<>();
        for (ItemKcMapping mapping : mappings) {
            mappingByKcId.put(mapping.getKcId(), mapping);
        }

        return knowledgeComponentRepository.findAllById(mappingByKcId.keySet()).stream()
                .sorted(Comparator.comparing(KnowledgeComponent::getName))
                .map(kcMapper::toResponse)
                .toList();
    }

    public KnowledgeComponentDetailResponse getDetail(Long id) {
        KnowledgeComponent knowledgeComponent = getEntityById(id);
        List<ItemKcMapping> mappings = itemKcMappingRepository.findByKcId(id);
        return kcMapper.toDetailResponse(
                knowledgeComponent,
                mappings.size(),
                0,
                mappings
        );
    }

    public KcStatsResponse getStats() {
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (KcCategory category : KcCategory.values()) {
            byCategory.put(
                    category.name(),
                    knowledgeComponentRepository.findAll().stream().filter(kc -> kc.getCategory() == category).count()
            );
        }

        Map<String, Long> byCefr = new LinkedHashMap<>();
        for (CefrLevel level : CefrLevel.values()) {
            byCefr.put(
                    level.name(),
                    knowledgeComponentRepository.findAll().stream().filter(kc -> kc.getCefrLevel() == level).count()
            );
        }

        return new KcStatsResponse(knowledgeComponentRepository.count(), byCategory, byCefr);
    }

    @Transactional
    public void mapItemToKcs(KcItemType itemType, Long itemId, List<Long> kcIds, List<Double> weights) {
        if (kcIds.size() != weights.size()) {
            throw new IllegalArgumentException("kcIds and weights must have the same size");
        }

        List<ItemKcMapping> existingMappings = itemKcMappingRepository.findByItemTypeAndItemId(itemType, itemId);
        if (!existingMappings.isEmpty()) {
            itemKcMappingRepository.deleteAll(existingMappings);
        }

        List<ItemKcMapping> newMappings = new ArrayList<>();
        for (int index = 0; index < kcIds.size(); index++) {
            Long kcId = kcIds.get(index);
            getEntityById(kcId);

            ItemKcMapping mapping = new ItemKcMapping();
            mapping.setItemType(itemType);
            mapping.setItemId(itemId);
            mapping.setKcId(kcId);
            mapping.setWeight(weights.get(index));
            newMappings.add(mapping);
        }

        itemKcMappingRepository.saveAll(newMappings);
    }

    public KnowledgeComponent getEntityById(Long id) {
        return knowledgeComponentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge component not found with id: " + id));
    }
}
