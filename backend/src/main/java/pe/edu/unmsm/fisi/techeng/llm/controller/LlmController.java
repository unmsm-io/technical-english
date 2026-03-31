package pe.edu.unmsm.fisi.techeng.llm.controller;

import pe.edu.unmsm.fisi.techeng.llm.dto.GenerateExercisesRequest;
import pe.edu.unmsm.fisi.techeng.llm.dto.GeneratedExercise;
import pe.edu.unmsm.fisi.techeng.llm.service.LlmService;
import pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/llm")
@RequiredArgsConstructor
@Tag(name = "LLM", description = "AI-powered exercise generation")
public class LlmController {

    private final LlmService llmService;

    @PostMapping("/generate-exercises")
    @Operation(summary = "Generate exercises using LLM for a lesson")
    public ResponseEntity<ApiResponse<List<GeneratedExercise>>> generateExercises(
            @Valid @RequestBody GenerateExercisesRequest request) {
        var exercises = llmService.generateExercises(request);
        return ResponseEntity.ok(ApiResponse.ok(exercises, "Generated " + exercises.size() + " exercises"));
    }
}
