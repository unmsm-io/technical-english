package pe.edu.unmsm.fisi.techeng.vocabulary.mapper;

import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;

@Component
public class VocabularyMapper {

    public VocabularyResponse toResponse(VocabularyItem item) {
        return new VocabularyResponse(
                item.getId(),
                item.getTerm(),
                item.getDefinition(),
                item.getCefrLevel(),
                item.getLayer(),
                item.getFrequency(),
                item.getPartOfSpeech(),
                item.getExampleSentence(),
                item.getProtectedToken(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
