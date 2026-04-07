package pe.edu.unmsm.fisi.techeng.kc.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryEntry;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;

@Component
public class KcMapper {

    public KnowledgeComponentResponse toResponse(KnowledgeComponent knowledgeComponent) {
        return new KnowledgeComponentResponse(
                knowledgeComponent.getId(),
                knowledgeComponent.getName(),
                knowledgeComponent.getNameEs(),
                knowledgeComponent.getDescription(),
                knowledgeComponent.getCategory(),
                knowledgeComponent.getCefrLevel(),
                knowledgeComponent.getPInitialLearned(),
                knowledgeComponent.getPTransition(),
                knowledgeComponent.getPGuess(),
                knowledgeComponent.getPSlip(),
                knowledgeComponent.isActive()
        );
    }

    public KcMasteryEntry toMasteryEntry(KnowledgeComponent knowledgeComponent, KcMasteryState state) {
        return new KcMasteryEntry(
                knowledgeComponent.getId(),
                knowledgeComponent.getName(),
                knowledgeComponent.getNameEs(),
                knowledgeComponent.getCategory(),
                state.getPLearned(),
                state.getTotalResponses(),
                state.getCorrectResponses(),
                state.getMasteredAt()
        );
    }

    public KnowledgeComponentDetailResponse toDetailResponse(
            KnowledgeComponent knowledgeComponent,
            long linkedItemsCount,
            long totalResponses,
            List<ItemKcMapping> mappings
    ) {
        return new KnowledgeComponentDetailResponse(
                toResponse(knowledgeComponent),
                linkedItemsCount,
                totalResponses,
                mappings.stream()
                        .map(mapping -> new KnowledgeComponentDetailResponse.RelatedItemResponse(
                                mapping.getItemType().name(),
                                mapping.getItemId(),
                                mapping.getWeight()
                        ))
                        .toList()
        );
    }

    public KcMasteryDetailResponse toMasteryDetailResponse(
            KnowledgeComponent knowledgeComponent,
            KcMasteryState state,
            List<KcResponseLog> history,
            List<ItemKcMapping> relatedItems
    ) {
        return new KcMasteryDetailResponse(
                toResponse(knowledgeComponent),
                new KcMasteryDetailResponse.StateSnapshot(
                        state.getUserId(),
                        state.getPLearned(),
                        state.getConsecutiveCorrect(),
                        state.getConsecutiveIncorrect(),
                        state.getTotalResponses(),
                        state.getCorrectResponses(),
                        state.getLastResponseAt(),
                        state.getMasteredAt()
                ),
                history.stream()
                        .map(log -> new KcMasteryDetailResponse.HistoryEntry(
                                log.getId(),
                                log.getItemType().name(),
                                log.getItemId(),
                                log.isCorrect(),
                                log.getPLearnedBefore(),
                                log.getPLearnedAfter(),
                                log.getRespondedAt()
                        ))
                        .toList(),
                relatedItems.stream()
                        .map(mapping -> new KcMasteryDetailResponse.RelatedItem(
                                mapping.getItemType().name(),
                                mapping.getItemId(),
                                mapping.getWeight()
                        ))
                        .toList()
        );
    }
}
