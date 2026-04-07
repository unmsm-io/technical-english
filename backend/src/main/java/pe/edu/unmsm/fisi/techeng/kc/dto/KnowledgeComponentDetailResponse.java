package pe.edu.unmsm.fisi.techeng.kc.dto;

import java.util.List;

public record KnowledgeComponentDetailResponse(
        KnowledgeComponentResponse knowledgeComponent,
        long linkedItemsCount,
        long totalResponses,
        List<RelatedItemResponse> relatedItems
) {

    public record RelatedItemResponse(
            String itemType,
            Long itemId,
            double weight
    ) {
    }
}
