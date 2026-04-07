package pe.edu.unmsm.fisi.techeng.vocabulary.dto;

import java.time.LocalDateTime;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;

public record VocabularyResponse(
        Long id,
        String term,
        String definition,
        CefrLevel cefrLevel,
        VocabularyLayer layer,
        Integer frequency,
        String partOfSpeech,
        String exampleSentence,
        Boolean protectedToken,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
