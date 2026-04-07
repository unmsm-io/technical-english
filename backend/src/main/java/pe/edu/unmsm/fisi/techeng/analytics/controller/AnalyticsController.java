package pe.edu.unmsm.fisi.techeng.analytics.controller;

import pe.edu.unmsm.fisi.techeng.analytics.dto.AcquisitionRateResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.CohortAcquisitionResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.CohortMasteryResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.DashboardStatsResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowAlertResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.StabilityHeatmapResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.UserStatsResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.analytics.service.AnalyticsService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "User performance analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/users/{userId}/stats")
    @Operation(summary = "Get user performance statistics")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getUserStats(userId)));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboardStats()));
    }

    @GetMapping("/users/{userId}/mastery-radar")
    @Operation(summary = "Obtener radar de mastery del estudiante")
    public ResponseEntity<ApiResponse<MasteryRadarResponse>> getStudentMasteryRadar(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStudentMasteryRadar(userId)));
    }

    @GetMapping("/users/{userId}/stability-heatmap")
    @Operation(summary = "Obtener heatmap de estabilidad FSRS")
    public ResponseEntity<ApiResponse<StabilityHeatmapResponse>> getStudentStabilityHeatmap(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStudentStabilityHeatmap(userId)));
    }

    @GetMapping("/users/{userId}/acquisition-rate")
    @Operation(summary = "Obtener ritmo de adquisición de vocabulario")
    public ResponseEntity<ApiResponse<AcquisitionRateResponse>> getVocabularyAcquisitionRate(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getVocabularyAcquisitionRate(userId)));
    }

    @GetMapping("/users/{userId}/flow-alert")
    @Operation(summary = "Obtener estado de flow del estudiante")
    public ResponseEntity<ApiResponse<FlowAlertResponse>> getFlowAlert(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getFlowAlert(userId)));
    }

    @GetMapping("/cohort/mastery")
    @Operation(summary = "Obtener distribución de mastery de la cohorte")
    public ResponseEntity<ApiResponse<CohortMasteryResponse>> getCohortMastery() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getCohortMastery()));
    }

    @GetMapping("/cohort/acquisition")
    @Operation(summary = "Obtener adquisición agregada de la cohorte")
    public ResponseEntity<ApiResponse<CohortAcquisitionResponse>> getCohortAcquisition() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getCohortAcquisition()));
    }
}
