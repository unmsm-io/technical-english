package pe.edu.unmsm.fisi.techeng.practice.controller;

import pe.edu.unmsm.fisi.techeng.practice.dto.*;
import pe.edu.unmsm.fisi.techeng.practice.service.PracticeService;
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
@Tag(name = "Practice", description = "Exercises, quizzes, and attempts")
public class PracticeController {

    private final PracticeService practiceService;

    @PostMapping("/exercises")
    @Operation(summary = "Create an exercise")
    public ResponseEntity<ApiResponse<ExerciseResponse>> createExercise(
            @Valid @RequestBody CreateExerciseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(practiceService.createExercise(request), "Exercise created"));
    }

    @GetMapping("/lessons/{lessonId}/exercises")
    @Operation(summary = "List exercises for a lesson")
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> listExercises(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.ok(practiceService.listExercises(lessonId)));
    }

    @GetMapping("/exercises/{id}")
    @Operation(summary = "Get exercise by ID (without correct answer)")
    public ResponseEntity<ApiResponse<ExerciseResponse>> getExercise(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getExercise(id)));
    }

    @PostMapping("/attempts")
    @Operation(summary = "Submit an answer to an exercise")
    public ResponseEntity<ApiResponse<AttemptResponse>> submitAnswer(
            @Valid @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(practiceService.submitAnswer(request), "Answer submitted"));
    }

    @GetMapping("/users/{userId}/attempts")
    @Operation(summary = "Get all attempts for a user")
    public ResponseEntity<ApiResponse<List<AttemptResponse>>> getUserAttempts(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(practiceService.getUserAttempts(userId)));
    }
}
