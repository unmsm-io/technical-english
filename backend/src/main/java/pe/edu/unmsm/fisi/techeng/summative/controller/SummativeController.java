package pe.edu.unmsm.fisi.techeng.summative.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.summative.dto.SummativeDtos;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativePhase;
import pe.edu.unmsm.fisi.techeng.summative.service.SummativeService;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

@RestController
@RequestMapping("/api/v1/summative")
@RequiredArgsConstructor
@Tag(name = "Pruebas finales", description = "Evaluaciones integradas de lectura, produccion y comprension para ingles tecnico")
public class SummativeController {

    private final SummativeService summativeService;

    @GetMapping("/tests")
    @Operation(summary = "Listar pruebas finales", description = "Filtra pruebas finales por tipo de tarea y nivel CEFR.")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<SummativeDtos.SummativeTestResponse>>> listTests(
            @RequestParam(required = false) TaskType type,
            @RequestParam(required = false) CefrLevel cefr,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                summativeService.list(type, cefr, q, PageRequest.of(page, size))
        ));
    }

    @GetMapping("/tests/{id}")
    @Operation(summary = "Obtener prueba final", description = "Devuelve el contenido del test sin exponer respuestas correctas.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeTestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.getById(id)));
    }

    @GetMapping("/tests/{id}/detail")
    @Operation(summary = "Obtener detalle completo de prueba final", description = "Devuelve el test incluyendo respuestas correctas para revision interna.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeTestDetailResponse>> getDetailById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.getDetailById(id)));
    }

    @PostMapping("/attempts")
    @Operation(summary = "Iniciar intento sumativo", description = "Crea un intento en fase READING para un usuario y una prueba final.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeAttemptResponse>> start(
            @RequestParam Long userId,
            @RequestParam Long testId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(summativeService.start(userId, testId)));
    }

    @PatchMapping("/attempts/{id}/phase")
    @Operation(summary = "Avanzar fase sumativa", description = "Mueve el intento a la siguiente fase valida.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeAttemptResponse>> advancePhase(
            @PathVariable Long id,
            @Valid @RequestBody SummativeDtos.AdvancePhaseRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.advancePhase(id, request.phase())));
    }

    @PostMapping("/attempts/{id}/production")
    @Operation(summary = "Enviar produccion sumativa", description = "Evalua la respuesta escrita en ingles y avanza a comprension.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeAttemptResponse>> submitProduction(
            @PathVariable Long id,
            @Valid @RequestBody SummativeDtos.SubmitProductionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.submitProduction(id, request.answerEn())));
    }

    @PostMapping("/attempts/{id}/comprehension")
    @Operation(summary = "Enviar comprension sumativa", description = "Evalua el bloque de MCQ, calcula score final y completa el intento.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeResultResponse>> submitComprehension(
            @PathVariable Long id,
            @Valid @RequestBody SummativeDtos.SubmitComprehensionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.submitComprehension(id, request.answerIdxs())));
    }

    @GetMapping("/attempts")
    @Operation(summary = "Listar historial sumativo", description = "Devuelve los intentos sumativos completados de un usuario.")
    public ResponseEntity<ApiResponse<List<SummativeDtos.SummativeAttemptHistoryResponse>>> getHistory(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.getHistory(userId)));
    }

    @GetMapping("/attempts/{id}")
    @Operation(summary = "Obtener intento sumativo", description = "Recupera el estado actual del intento sumativo.")
    public ResponseEntity<ApiResponse<SummativeDtos.SummativeAttemptResponse>> getAttempt(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(summativeService.getAttemptById(id)));
    }
}
