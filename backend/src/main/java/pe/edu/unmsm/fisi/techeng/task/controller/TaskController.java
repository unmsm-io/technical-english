package pe.edu.unmsm.fisi.techeng.task.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskDetailResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskStatsResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskTypeResponse;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.service.TaskService;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tareas TBLT", description = "Consulta de tareas autenticas de ingenieria con estructura pre-task, during-task y post-task")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(
            summary = "Listar tareas TBLT",
            description = "Obtiene tareas paginadas con filtros opcionales por tipo, nivel CEFR y busqueda textual.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tareas obtenidas correctamente"),
                    @ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<Page<TaskResponse>>> list(
            @RequestParam(required = false) TaskType type,
            @RequestParam(required = false, name = "cefr") CefrLevel cefrLevel,
            @RequestParam(required = false, name = "q") String query,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskService.search(type, cefrLevel, query, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener detalle de tarea",
            description = "Recupera el contenido completo de una tarea con micro-glosses y vocabulario relacionado.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarea encontrada"),
                    @ApiResponse(responseCode = "404", description = "Tarea no encontrada", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskDetailResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskService.getById(id)));
    }

    @GetMapping("/types")
    @Operation(summary = "Listar tipos de tarea", description = "Devuelve los tipos de tarea disponibles con su etiqueta en espanol.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<TaskTypeResponse>>> getTypes() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskService.getTypes()));
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadisticas de tareas", description = "Devuelve conteos agregados por tipo y nivel CEFR.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<TaskStatsResponse>> getStats() {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(taskService.getStats()));
    }
}
