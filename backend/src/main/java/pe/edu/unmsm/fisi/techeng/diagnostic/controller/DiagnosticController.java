package pe.edu.unmsm.fisi.techeng.diagnostic.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticAttemptHistoryResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticAttemptStartResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticItemResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticResultResponse;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticStartRequest;
import pe.edu.unmsm.fisi.techeng.diagnostic.dto.DiagnosticSubmitRequest;

@RestController
@RequestMapping("/api/v1/diagnostic")
@RequiredArgsConstructor
@Tag(name = "Diagnostico", description = "Flujo de ubicacion CEFR para usuarios de ingles tecnico")
public class DiagnosticController {

    private final pe.edu.unmsm.fisi.techeng.diagnostic.service.DiagnosticService diagnosticService;

    @PostMapping("/attempts")
    @Operation(
            summary = "Iniciar intento diagnostico",
            description = "Crea un nuevo intento para un usuario y devuelve los 15 items del diagnostico.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Intento creado correctamente"),
                    @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<DiagnosticAttemptStartResponse>> startAttempt(
            @Valid @RequestBody DiagnosticStartRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(diagnosticService.startAttempt(request.userId())));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @Operation(
            summary = "Enviar intento diagnostico",
            description = "Evalua las respuestas, calcula el placement CEFR y actualiza el perfil del usuario.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Diagnostico evaluado correctamente"),
                    @ApiResponse(responseCode = "400", description = "Respuestas invalidas", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<DiagnosticResultResponse>> submitAttempt(
            @PathVariable Long attemptId,
            @Valid @RequestBody DiagnosticSubmitRequest request
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(diagnosticService.submitAttempt(attemptId, request.responses())));
    }

    @GetMapping("/attempts")
    @Operation(summary = "Listar historial diagnostico", description = "Devuelve el historial de intentos de un usuario.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<DiagnosticAttemptHistoryResponse>>> getHistory(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(diagnosticService.getHistory(userId)));
    }

    @GetMapping("/items")
    @Operation(summary = "Listar items del diagnostico", description = "Endpoint de apoyo para revisar los items cargados.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<DiagnosticItemResponse>>> getItems() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(diagnosticService.getItems()));
    }
}
