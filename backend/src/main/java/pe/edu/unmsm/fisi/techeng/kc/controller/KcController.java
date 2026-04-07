package pe.edu.unmsm.fisi.techeng.kc.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.kc.config.KcSeedRunner;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcExtractionResult;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcStatsResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KnowledgeComponentResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.MapItemRequest;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.service.KcMappingExtractor;
import pe.edu.unmsm.fisi.techeng.kc.service.KcService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@RestController
@RequestMapping("/api/v1/kc")
@RequiredArgsConstructor
@Tag(name = "Knowledge Components", description = "Gestion y consulta de componentes de conocimiento para mastery tracing")
public class KcController {

    private final KcService kcService;
    private final KcSeedRunner kcSeedRunner;

    @GetMapping
    @Operation(summary = "Listar knowledge components", description = "Obtiene KCs paginados con filtros por categoria, nivel CEFR y busqueda textual.")
    public ResponseEntity<ApiResponse<Page<KnowledgeComponentResponse>>> list(
            @RequestParam(required = false) KcCategory category,
            @RequestParam(required = false, name = "cefr") CefrLevel cefrLevel,
            @RequestParam(required = false, name = "q") String query,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(kcService.search(category, cefrLevel, query, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de KC", description = "Recupera un knowledge component con sus items relacionados.")
    public ResponseEntity<ApiResponse<KnowledgeComponentDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(kcService.getDetail(id)));
    }

    @GetMapping("/items")
    @Operation(summary = "Obtener KCs por item", description = "Devuelve los KCs vinculados a un item especifico de diagnostico, tarea o vocabulario.")
    public ResponseEntity<ApiResponse<java.util.List<KnowledgeComponentResponse>>> getByItem(
            @RequestParam KcItemType type,
            @RequestParam Long itemId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(kcService.getByItem(type, itemId)));
    }

    @PostMapping("/extract")
    @Operation(summary = "Extraer y persistir KCs con LLM", description = "Ejecuta la extraccion LLM, escribe el JSON en seeds/kc y persiste KCs y mappings.")
    public ResponseEntity<ApiResponse<KcExtractionResult>> extract() {
        KcMappingExtractor.ExtractionSeedData result = kcSeedRunner.extractAndPersist();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                new KcExtractionResult(
                        result.knowledgeComponents().size(),
                        result.mappings().size(),
                        result.durationMs(),
                        result.rejectedItems()
                )
        ));
    }

    @PostMapping("/map-item")
    @Operation(summary = "Mapear item a KCs", description = "Reemplaza los mappings de un item por la lista de KCs y pesos enviados.")
    public ResponseEntity<Void> mapItem(@Valid @RequestBody MapItemRequest request) {
        kcService.mapItemToKcs(request.itemType(), request.itemId(), request.kcIds(), request.weights());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadisticas de KCs", description = "Devuelve conteos agregados por categoria y nivel CEFR.")
    public ResponseEntity<ApiResponse<KcStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(kcService.getStats()));
    }
}
