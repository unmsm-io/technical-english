package pe.edu.unmsm.fisi.techeng.analytics.controller;

import pe.edu.unmsm.fisi.techeng.analytics.dto.UserStatsResponse;
import pe.edu.unmsm.fisi.techeng.analytics.dto.DashboardStatsResponse;
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
}
