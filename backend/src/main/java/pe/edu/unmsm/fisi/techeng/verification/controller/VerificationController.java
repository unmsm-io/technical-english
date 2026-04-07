package pe.edu.unmsm.fisi.techeng.verification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.verification.dto.ApproveRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemDetailResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.RejectRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.VerificationMetricsResponse;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.mapper.VerificationMapper;
import pe.edu.unmsm.fisi.techeng.verification.service.GeneratedItemService;

@RestController
@RequestMapping("/api/v1/verification")
@Tag(name = "Verificacion LLM", description = "Pipeline multi-agente para generar y revisar items diagnosticos")
public class VerificationController {

    private final GeneratedItemService generatedItemService;
    private final VerificationMapper verificationMapper;

    public VerificationController(GeneratedItemService generatedItemService, VerificationMapper verificationMapper) {
        this.generatedItemService = generatedItemService;
        this.verificationMapper = verificationMapper;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generar item verificado", description = "Ejecuta el pipeline completo de generacion y verificacion.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<GeneratedItemResponse>> generate(@Valid @RequestBody GenerationRequest request) {
        GeneratedItemResponse response = verificationMapper.toResponse(
                generatedItemService.requestGeneration(request.requestedBy(), request)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(response));
    }

    @GetMapping("/items")
    @Operation(summary = "Listar items generados", description = "Lista items filtrados por estado para revision administrativa.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<Page<GeneratedItemResponse>>> listItems(
            @RequestParam(required = false) GeneratedItemState state,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<GeneratedItemResponse> response = generatedItemService.listPendingReview(state, PageRequest.of(page, size))
                .map(verificationMapper::toResponse);
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(response));
    }

    @GetMapping("/items/{id}")
    @Operation(
            summary = "Obtener detalle de item generado",
            description = "Devuelve el item con logs de verificadores y notas de revision.",
            responses = @ApiResponse(responseCode = "404", description = "Item no encontrado", content = @Content)
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<GeneratedItemDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(generatedItemService.getResponseBundle(id).detail()));
    }

    @PostMapping("/items/{id}/approve")
    @Operation(summary = "Aprobar item generado", description = "Promueve el item a DiagnosticItem real.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<GeneratedItemResponse>> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRequest request
    ) {
        GeneratedItemResponse response = verificationMapper.toResponse(generatedItemService.approve(id, request.approvedBy()));
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(response));
    }

    @PostMapping("/items/{id}/reject")
    @Operation(summary = "Rechazar item generado", description = "Marca el item como rechazado con una razon administrativa.")
    public ResponseEntity<Void> reject(@PathVariable Long id, @Valid @RequestBody RejectRequest request) {
        generatedItemService.reject(id, request.reason());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/metrics")
    @Operation(summary = "Obtener metricas del pipeline", description = "Expone aprobacion, rechazos y score promedio del pipeline.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<VerificationMetricsResponse>> metrics() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(generatedItemService.getMetrics()));
    }
}
