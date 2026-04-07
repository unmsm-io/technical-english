package pe.edu.unmsm.fisi.techeng.task.controller;

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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.task.dto.AdvancePhaseRequest;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskAttemptHistoryResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskAttemptResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskFeedbackResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.SubmitTaskRequest;
import pe.edu.unmsm.fisi.techeng.task.service.TaskAttemptService;

@RestController
@RequestMapping("/api/v1/task-attempts")
@RequiredArgsConstructor
@Tag(name = "Intentos de tarea TBLT", description = "Gestion de intentos, transiciones de fase y feedback de tareas autenticas")
public class TaskAttemptController {

    private final TaskAttemptService taskAttemptService;

    @PostMapping
    @Operation(
            summary = "Iniciar intento de tarea",
            description = "Crea un intento en fase PRE_TASK para un usuario y una tarea.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Intento creado correctamente"),
                    @ApiResponse(responseCode = "404", description = "Usuario o tarea no encontrados", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskAttemptResponse>> start(
            @RequestParam Long userId,
            @RequestParam Long taskId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.start(userId, taskId)));
    }

    @PatchMapping("/{id}/phase")
    @Operation(summary = "Avanzar fase de tarea", description = "Avanza la tarea a la siguiente fase valida.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskAttemptResponse>> advancePhase(
            @PathVariable Long id,
            @Valid @RequestBody AdvancePhaseRequest request
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.advancePhase(id, request.phase())));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Enviar respuesta de tarea", description = "Genera feedback CEFR-calibrado y mueve el intento a POST_TASK.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskFeedbackResponse>> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitTaskRequest request
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.submit(id, request.userAnswerEn())));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Completar tarea", description = "Marca el intento como COMPLETED despues de revisar el feedback.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskAttemptResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.complete(id)));
    }

    @GetMapping
    @Operation(summary = "Listar historial de tareas", description = "Devuelve el historial de tareas TBLT de un usuario.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<TaskAttemptHistoryResponse>>> getHistory(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.getHistory(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener intento por ID", description = "Recupera el estado actual de un intento de tarea.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskAttemptResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskAttemptService.getById(id)));
    }
}
