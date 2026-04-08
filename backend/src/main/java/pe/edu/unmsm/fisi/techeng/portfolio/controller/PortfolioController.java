package pe.edu.unmsm.fisi.techeng.portfolio.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.portfolio.service.PortfolioService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portafolio", description = "Resumen auto-colectado del progreso del estudiante")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/users/{userId}")
    @Operation(summary = "Obtener portafolio actual", description = "Devuelve el snapshot más reciente del portafolio del estudiante.")
    public ResponseEntity<ApiResponse<PortfolioDtos.PortfolioResponse>> getCurrentPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getCurrentPortfolio(userId)));
    }

    @GetMapping("/users/{userId}/timeline")
    @Operation(summary = "Obtener línea de tiempo", description = "Lista tareas y pruebas finales en orden cronológico.")
    public ResponseEntity<ApiResponse<PortfolioDtos.PortfolioTimelineResponse>> getTimeline(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getTimeline(userId)));
    }

    @GetMapping("/users/{userId}/history")
    @Operation(summary = "Obtener historial de snapshots", description = "Devuelve snapshots históricos del portafolio por semana.")
    public ResponseEntity<ApiResponse<List<PortfolioDtos.PortfolioSnapshotResponse>>> getHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "12") int weeks
    ) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getHistory(userId, weeks)));
    }

    @PostMapping("/recompute")
    @Operation(summary = "Recomputar todos los portafolios", description = "Recalcula los snapshots de todos los usuarios activos.")
    public ResponseEntity<ApiResponse<List<PortfolioDtos.PortfolioSnapshotResponse>>> recomputeAll() {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.recomputeAll()));
    }

    @PostMapping("/users/{userId}/recompute")
    @Operation(summary = "Recomputar un portafolio", description = "Fuerza el recálculo del portafolio de un usuario.")
    public ResponseEntity<ApiResponse<PortfolioDtos.PortfolioResponse>> recomputeOne(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.recomputeOne(userId)));
    }
}
