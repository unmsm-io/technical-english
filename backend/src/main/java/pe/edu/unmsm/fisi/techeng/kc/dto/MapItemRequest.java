package pe.edu.unmsm.fisi.techeng.kc.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;

public record MapItemRequest(
        @NotNull KcItemType itemType,
        @NotNull Long itemId,
        @NotEmpty List<Long> kcIds,
        @NotEmpty List<Double> weights
) {
}
