package pe.edu.unmsm.fisi.techeng.diagnostic.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;

@Component
@RequiredArgsConstructor
public class DiagnosticSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DiagnosticSeeder.class);

    private final DiagnosticItemRepository diagnosticItemRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (diagnosticItemRepository.count() > 0) {
            logger.info("Diagnostic seed skipped because the table already contains data");
            return;
        }

        ClassPathResource resource = new ClassPathResource("seeds/diagnostic/items.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<DiagnosticSeedItem> items = objectMapper.readValue(inputStream, new TypeReference<>() {});
            diagnosticItemRepository.saveAll(items.stream().map(DiagnosticSeedItem::toEntity).toList());
            logger.info("Loaded {} diagnostic items", items.size());
        }
    }

    private record DiagnosticSeedItem(
            pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel cefrLevel,
            pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill skill,
            String questionText,
            List<String> options,
            Integer correctAnswerIdx,
            String explanationEs
    ) {
        private DiagnosticItem toEntity() {
            DiagnosticItem item = new DiagnosticItem();
            item.setCefrLevel(cefrLevel);
            item.setSkill(skill);
            item.setQuestionText(questionText);
            item.setOptionsJson(writeOptions(options));
            item.setCorrectAnswerIdx(correctAnswerIdx);
            item.setExplanationEs(explanationEs);
            return item;
        }

        private String writeOptions(List<String> optionList) {
            try {
                return new ObjectMapper().writeValueAsString(optionList);
            } catch (IOException exception) {
                throw new IllegalStateException("No se pudo serializar las opciones del item diagnostico", exception);
            }
        }
    }
}
