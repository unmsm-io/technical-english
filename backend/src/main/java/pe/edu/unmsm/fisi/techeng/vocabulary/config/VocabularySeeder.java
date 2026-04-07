package pe.edu.unmsm.fisi.techeng.vocabulary.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@Component
@RequiredArgsConstructor
public class VocabularySeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(VocabularySeeder.class);

    private final VocabularyRepository vocabularyRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (vocabularyRepository.count() > 0) {
            logger.info("Vocabulary seed skipped because the table already contains data");
            return;
        }

        loadFile("seeds/vocabulary/gsl-top-500.csv", VocabularyLayer.GSL);
        loadFile("seeds/vocabulary/awl-sublist-1-2.csv", VocabularyLayer.AWL);
        loadFile("seeds/vocabulary/eewl-top-100.csv", VocabularyLayer.EEWL);
        loadFile("seeds/vocabulary/csawl-top-100.csv", VocabularyLayer.CSAWL);
    }

    private void loadFile(String path, VocabularyLayer expectedLayer) throws Exception {
        List<VocabularyItem> items = new ArrayList<>();
        ClassPathResource resource = new ClassPathResource(path);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] columns = line.split("\\|", -1);
                VocabularyItem item = new VocabularyItem();
                item.setTerm(columns[0].trim());
                item.setDefinition(columns[1].trim());
                item.setCefrLevel(CefrLevel.valueOf(columns[2].trim()));
                item.setLayer(VocabularyLayer.valueOf(columns[3].trim()));
                item.setFrequency(Integer.parseInt(columns[4].trim()));
                item.setPartOfSpeech(columns[5].trim());
                item.setExampleSentence(columns[6].trim());
                item.setProtectedToken(Boolean.parseBoolean(columns[7].trim()));
                items.add(item);
            }
        }
        vocabularyRepository.saveAll(items);
        logger.info("Loaded {} vocabulary items for {}", items.size(), expectedLayer);
    }
}
