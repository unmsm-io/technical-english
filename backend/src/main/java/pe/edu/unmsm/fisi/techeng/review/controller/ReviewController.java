package pe.edu.unmsm.fisi.techeng.review.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.unmsm.fisi.techeng.review.dto.GradeCardRequest;
import pe.edu.unmsm.fisi.techeng.review.dto.GradeCardWithExampleRequest;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewBootstrapResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardWithFeedbackResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewStatsResponse;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.review.service.ReviewCardService;
import pe.edu.unmsm.fisi.techeng.review.service.ReviewFeedbackService;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Repaso FSRS", description = "Gestion de tarjetas de repaso FSRS-6 para vocabulario tecnico")
public class ReviewController {

    private final ReviewCardService reviewCardService;
    private final ReviewFeedbackService reviewFeedbackService;

    @GetMapping("/due")
    @Operation(summary = "Listar tarjetas vencidas", description = "Devuelve las tarjetas de repaso vencidas para la sesion actual del usuario.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<List<ReviewCardResponse>>> getDueCards(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.getDueCards(userId, limit)));
    }

    @PostMapping("/{cardId}/grade")
    @Operation(
            summary = "Calificar tarjeta",
            description = "Aplica la calificacion AGAIN/HARD/GOOD/EASY y reprograma la tarjeta con FSRS-6.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tarjeta reprogramada"),
                    @ApiResponse(responseCode = "404", description = "Tarjeta no encontrada", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ReviewCardResponse>> gradeCard(
            @PathVariable Long cardId,
            @Valid @RequestBody GradeCardRequest request
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.gradeCard(cardId, request.grade())));
    }

    @PostMapping("/{cardId}/grade-with-example")
    @Operation(summary = "Calificar tarjeta con ejemplo", description = "Reprograma la tarjeta y genera feedback corto sobre una frase producida por el estudiante.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ReviewCardWithFeedbackResponse>> gradeCardWithExample(
            @PathVariable Long cardId,
            @Valid @RequestBody GradeCardWithExampleRequest request
    ) {
        ReviewCard reviewCard = reviewCardService.getReviewCardOrThrow(cardId);
        ReviewCardResponse card = reviewCardService.gradeCard(cardId, request.grade());
        String userCefrLevel = reviewCardService.getUserOrThrow(reviewCard.getUserId()).getEnglishLevel();

        ReviewCardWithFeedbackResponse response = new ReviewCardWithFeedbackResponse(
                card,
                reviewFeedbackService.generateFeedback(
                        reviewCardService.getVocabularyItemOrThrow(reviewCard.getVocabularyItemId()),
                        request.exampleSentence(),
                        request.grade(),
                        userCefrLevel == null || userCefrLevel.isBlank() ? "A2" : userCefrLevel
                )
        );
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(response));
    }

    @PostMapping("/bootstrap")
    @Operation(summary = "Bootstrap manual del deck", description = "Crea las tarjetas iniciales para un usuario segun su placement CEFR actual.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ReviewBootstrapResponse>> bootstrap(@RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.bootstrapForUser(userId)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadisticas del deck", description = "Devuelve conteos, retention rate, estabilidad promedio y tarjetas con mas fallos.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ReviewStatsResponse>> getStats(@RequestParam Long userId) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.getStats(userId)));
    }

    @GetMapping("/deck")
    @Operation(summary = "Listar deck completo", description = "Devuelve el deck paginado con filtros opcionales por estado, tier, capa y consulta.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<Page<ReviewCardResponse>>> getDeck(
            @RequestParam Long userId,
            @RequestParam(required = false) CardState state,
            @RequestParam(required = false) RetentionTier tier,
            @RequestParam(required = false) VocabularyLayer layer,
            @RequestParam(required = false, name = "q") String query,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.getDeck(userId, state, tier, layer, query, pageable)));
    }

    @GetMapping("/{cardId}")
    @Operation(summary = "Obtener tarjeta", description = "Recupera una tarjeta de repaso por id.")
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ReviewCardResponse>> getCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(reviewCardService.getCard(cardId)));
    }

    @PostMapping("/{cardId}/reset")
    @Operation(summary = "Reiniciar tarjeta", description = "Devuelve la tarjeta al estado NEW para depuracion o demos.")
    public ResponseEntity<Void> resetCard(@PathVariable Long cardId) {
        reviewCardService.resetCard(cardId);
        return ResponseEntity.noContent().build();
    }
}
