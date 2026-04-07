package pe.edu.unmsm.fisi.techeng.calibration.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibratedItemResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationRunResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationStatsResponse;
import pe.edu.unmsm.fisi.techeng.calibration.dto.UserAbilityResponse;
import pe.edu.unmsm.fisi.techeng.calibration.service.CalibrationService;

@RestController
@RequestMapping("/api/v1/calibration")
@Tag(name = "Calibracion IRT", description = "Endpoints administrativos para Rasch y habilidad theta")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Obtener metricas de calibracion",
            description = "Devuelve conteos por estado, promedios de dificultad y el ultimo momento calibrado.",
            responses = @ApiResponse(responseCode = "200", description = "Metricas obtenidas correctamente")
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<CalibrationStatsResponse>> getStats() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(calibrationService.getStats()));
    }

    @GetMapping("/items")
    @Operation(
            summary = "Listar items calibrados",
            description = "Devuelve los items diagnosticos con sus parametros Rasch y cantidad de respuestas.",
            responses = @ApiResponse(responseCode = "200", description = "Items obtenidos correctamente")
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<CalibratedItemResponse>>> getItems() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(calibrationService.getItems()));
    }

    @PostMapping("/run")
    @Operation(
            summary = "Ejecutar calibracion manual",
            description = "Lanza un ciclo de calibracion completo sobre los intentos diagnosticos completados.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Calibracion ejecutada correctamente"),
                    @ApiResponse(responseCode = "500", description = "Fallo inesperado en la calibracion", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<CalibrationRunResponse>> runCalibration() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(calibrationService.runCalibrationCycle()));
    }

    @GetMapping("/users/{id}/ability")
    @Operation(
            summary = "Obtener habilidad de un usuario",
            description = "Devuelve theta, error estandar y nivel CEFR predicho para un usuario.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Habilidad obtenida correctamente"),
                    @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<UserAbilityResponse>> getUserAbility(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(calibrationService.getUserAbility(id)));
    }
}
