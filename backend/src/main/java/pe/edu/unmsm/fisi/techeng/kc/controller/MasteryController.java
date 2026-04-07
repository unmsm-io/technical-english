package pe.edu.unmsm.fisi.techeng.kc.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.kc.service.MasteryService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/mastery")
@RequiredArgsConstructor
@Tag(name = "Mastery", description = "Consulta del estado de dominio BKT por usuario y knowledge component")
public class MasteryController {

    private final MasteryService masteryService;

    @GetMapping("/users/{userId}/radar")
    @Operation(summary = "Obtener radar de mastery", description = "Devuelve el estado actual de P(L) por knowledge component para un usuario.")
    public ResponseEntity<ApiResponse<MasteryRadarResponse>> getRadar(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(masteryService.getMasteryRadar(userId)));
    }

    @GetMapping("/users/{userId}/kcs/{kcId}")
    @Operation(summary = "Obtener detalle de mastery por KC", description = "Devuelve el historial reciente y el estado actual de un KC para un usuario.")
    public ResponseEntity<ApiResponse<KcMasteryDetailResponse>> getKcDetail(
            @PathVariable Long userId,
            @PathVariable Long kcId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(masteryService.getKcDetail(userId, kcId)));
    }

    @GetMapping("/users/{userId}/mastered-count")
    @Operation(summary = "Contar KCs dominados", description = "Devuelve la cantidad de KCs cuyo P(L) ya cruzo el threshold de mastery.")
    public ResponseEntity<ApiResponse<Long>> getMasteredCount(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(masteryService.countMasteredKcs(userId)));
    }

    @PostMapping("/users/{userId}/recompute")
    @Operation(summary = "Recalcular mastery", description = "Reconstruye el estado de mastery del usuario reejecutando los logs historicos.")
    public ResponseEntity<Void> recompute(@PathVariable Long userId) {
        masteryService.recompute(userId);
        return ResponseEntity.noContent().build();
    }
}
