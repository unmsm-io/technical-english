package pe.edu.unmsm.fisi.techeng.vocabulary.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.ProfileResult;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.TextProfileRequest;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TextProfiler;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.VocabularyService;

@RestController
@RequestMapping("/api/v1/vocabulary")
@RequiredArgsConstructor
@Tag(name = "Vocabulario", description = "Consulta y filtrado del vocabulario tecnico clasificado por capa y nivel CEFR")
public class VocabularyController {

    private final VocabularyService vocabularyService;
    private final TextProfiler textProfiler;

    @GetMapping
    @Operation(
            summary = "Listar vocabulario",
            description = "Obtiene vocabulario paginado con filtros opcionales por capa, nivel CEFR y busqueda textual.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<Page<VocabularyResponse>>> list(
            @RequestParam(required = false) VocabularyLayer layer,
            @RequestParam(required = false) CefrLevel cefrLevel,
            @RequestParam(required = false, name = "q") String query,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(vocabularyService.list(layer, cefrLevel, query, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener termino por ID",
            description = "Recupera el detalle completo de un termino del vocabulario.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Termino encontrado"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Termino no encontrado", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<VocabularyResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(vocabularyService.getById(id)));
    }

    @PostMapping("/profile")
    @Operation(
            summary = "Perfilar texto tecnico",
            description = "Clasifica tokens protegidos y aprendibles, estima cobertura lexica y detecta terminos desconocidos.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Perfil calculado correctamente"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud invalida", content = @Content)
            }
    )
    public ResponseEntity<pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse<ProfileResult>> profile(
            @Valid @RequestBody TextProfileRequest request
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(pe.edu.unmsm.fisi.techeng.shared.dto.ApiResponse.ok(textProfiler.profile(request.text())));
    }
}
