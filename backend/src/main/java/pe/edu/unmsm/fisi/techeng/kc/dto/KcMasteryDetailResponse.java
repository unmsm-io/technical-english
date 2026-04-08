package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.time.Instant;
import java.util.List;

public record KcMasteryDetailResponse(
        KnowledgeComponentResponse knowledgeComponent,
        StateSnapshot state,
        List<HistoryEntry> history,
        List<RelatedItem> relatedItems
) {

    public record StateSnapshot(
            Long userId,
            double pLearned,
            int consecutiveCorrect,
            int consecutiveIncorrect,
            int totalResponses,
            int correctResponses,
            Instant lastResponseAt,
            Instant masteredAt
    ) {
    }

    public record HistoryEntry(
            Long logId,
            String itemType,
            Long itemId,
            boolean correct,
            double pLearnedBefore,
            double pLearnedAfter,
            Instant respondedAt
    ) {
    }

    public record RelatedItem(
            String itemType,
            Long itemId,
            double weight
    ) {
    }
}
