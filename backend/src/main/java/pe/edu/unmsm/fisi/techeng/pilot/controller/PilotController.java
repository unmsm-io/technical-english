package pe.edu.unmsm.fisi.techeng.pilot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.pilot.dto.PilotDtos;
import pe.edu.unmsm.fisi.techeng.pilot.entity.CohortState;
import pe.edu.unmsm.fisi.techeng.pilot.service.PilotCohortService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/pilot")
@RequiredArgsConstructor
@Tag(name = "Pilot", description = "Administración local de cohortes y métricas pre/post")
public class PilotController {

    private final PilotCohortService pilotCohortService;

    @PostMapping("/cohorts")
    @Operation(summary = "Crear cohorte piloto", description = "Crea una cohorte local para el estudio piloto.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotCohortResponse>> create(@RequestBody PilotDtos.CreateCohortRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.create(request)));
    }

    @GetMapping("/cohorts")
    @Operation(summary = "Listar cohortes piloto", description = "Devuelve todas las cohortes del piloto.")
    public ResponseEntity<ApiResponse<List<PilotDtos.PilotCohortResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.list()));
    }

    @GetMapping("/cohorts/{id}")
    @Operation(summary = "Obtener cohorte piloto", description = "Recupera el detalle básico de una cohorte.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotCohortResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.getById(id)));
    }

    @PostMapping("/cohorts/{id}/enroll")
    @Operation(summary = "Inscribir usuario", description = "Inscribe un usuario y genera sus instrumentos pre-test.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotEnrollmentResponse>> enroll(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.enrollUser(id, userId)));
    }

    @PatchMapping("/cohorts/{id}/advance")
    @Operation(summary = "Avanzar fase", description = "Avanza la cohorte a la siguiente fase válida.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotCohortResponse>> advance(
            @PathVariable Long id,
            @RequestBody PilotDtos.AdvanceCohortRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.advancePhase(id, CohortState.valueOf(request.state()))));
    }

    @PostMapping("/cohorts/{id}/trigger-post-test")
    @Operation(summary = "Disparar post-test", description = "Genera los instrumentos post-test para todos los inscritos.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotCohortResponse>> triggerPostTest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.triggerPostTest(id)));
    }

    @GetMapping("/cohorts/{id}/results")
    @Operation(summary = "Calcular resultados", description = "Computa métricas pre/post y tamaños de efecto para la cohorte.")
    public ResponseEntity<ApiResponse<PilotDtos.PilotResultsResponse>> results(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.computeResults(id)));
    }

    @GetMapping("/cohorts/{id}/enrollments")
    @Operation(summary = "Listar enrollments", description = "Devuelve los usuarios inscritos con sus instrumentos enlazados.")
    public ResponseEntity<ApiResponse<List<PilotDtos.PilotEnrollmentResponse>>> enrollments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pilotCohortService.getEnrollments(id)));
    }
}
