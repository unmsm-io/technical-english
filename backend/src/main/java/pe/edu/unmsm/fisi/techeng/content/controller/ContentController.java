package pe.edu.unmsm.fisi.techeng.content.controller;

import pe.edu.unmsm.fisi.techeng.content.dto.*;
import pe.edu.unmsm.fisi.techeng.content.service.ContentService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Content", description = "Course modules and lessons")
public class ContentController {

    private final ContentService contentService;

    @PostMapping("/modules")
    @Operation(summary = "Create a new module")
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(
            @Valid @RequestBody CreateModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(contentService.createModule(request), "Module created"));
    }

    @GetMapping("/modules")
    @Operation(summary = "List all modules")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> listModules(
            @RequestParam(required = false) String level) {
        var modules = level != null
                ? contentService.listModulesByLevel(level)
                : contentService.listModules();
        return ResponseEntity.ok(ApiResponse.ok(modules));
    }

    @GetMapping("/modules/{id}")
    @Operation(summary = "Get module by ID")
    public ResponseEntity<ApiResponse<ModuleResponse>> getModule(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.getModule(id)));
    }

    @PostMapping("/lessons")
    @Operation(summary = "Create a new lesson")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @Valid @RequestBody CreateLessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(contentService.createLesson(request), "Lesson created"));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    @Operation(summary = "List lessons in a module")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> listLessons(@PathVariable Long moduleId) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.listLessons(moduleId)));
    }

    @GetMapping("/lessons/{id}")
    @Operation(summary = "Get lesson by ID")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.getLesson(id)));
    }
}
