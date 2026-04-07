package pe.edu.unmsm.fisi.techeng.kc.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.kc.service.KcMappingExtractor;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@Component
@RequiredArgsConstructor
@Slf4j
public class KcSeedRunner implements ApplicationRunner {

    private static final String EXTRACTED_RESOURCE = "seeds/kc/extracted-kcs.json";
    private static final String FALLBACK_RESOURCE = "seeds/kc/extracted-kcs-fallback.json";
    private static final Path EXTRACTED_OUTPUT_PATH = Path.of("src/main/resources/seeds/kc/extracted-kcs.json");

    private final KnowledgeComponentRepository knowledgeComponentRepository;
    private final ItemKcMappingRepository itemKcMappingRepository;
    private final KcMappingExtractor kcMappingExtractor;
    private final ObjectMapper objectMapper;

    @Value("${kc.extraction.enabled:false}")
    private boolean extractionEnabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (knowledgeComponentRepository.count() > 0) {
            log.info("KC seed skipped because the table already contains data");
            return;
        }

        SeedPayload payload = loadSeedPayload();
        persist(payload);
        log.info("Loaded {} KCs and {} item mappings", payload.knowledgeComponents().size(), payload.mappings().size());
    }

    public SeedPayload loadSeedPayload() throws IOException {
        if (new ClassPathResource(EXTRACTED_RESOURCE).exists()) {
            return readPayload(new ClassPathResource(EXTRACTED_RESOURCE).getInputStream());
        }

        if (extractionEnabled) {
            KcMappingExtractor.ExtractionSeedData extracted = kcMappingExtractor.extractAll();
            SeedPayload payload = new SeedPayload(extracted.knowledgeComponents(), extracted.mappings());
            writeExtractedPayload(payload);
            return payload;
        }

        return readPayload(new ClassPathResource(FALLBACK_RESOURCE).getInputStream());
    }

    public KcMappingExtractor.ExtractionSeedData extractAndPersist() {
        KcMappingExtractor.ExtractionSeedData extracted = kcMappingExtractor.extractAll();
        SeedPayload payload = new SeedPayload(extracted.knowledgeComponents(), extracted.mappings());
        try {
            writeExtractedPayload(payload);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo escribir extracted-kcs.json", exception);
        }
        persist(payload);
        return extracted;
    }

    private SeedPayload readPayload(InputStream inputStream) throws IOException {
        try (InputStream stream = inputStream) {
            return objectMapper.readValue(stream, SeedPayload.class);
        }
    }

    private void writeExtractedPayload(SeedPayload payload) throws IOException {
        Files.createDirectories(EXTRACTED_OUTPUT_PATH.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(EXTRACTED_OUTPUT_PATH.toFile(), payload);
    }

    private void persist(SeedPayload payload) {
        Map<String, KnowledgeComponent> knowledgeComponentsByName = new LinkedHashMap<>();
        for (KcMappingExtractor.ExtractedKnowledgeComponent item : payload.knowledgeComponents()) {
            KnowledgeComponent knowledgeComponent = knowledgeComponentRepository.findByName(item.name())
                    .orElseGet(KnowledgeComponent::new);
            knowledgeComponent.setName(item.name());
            knowledgeComponent.setNameEs(item.nameEs());
            knowledgeComponent.setDescription(item.description());
            knowledgeComponent.setCategory(item.category());
            knowledgeComponent.setCefrLevel(CefrLevel.valueOf(item.cefrLevel()));
            knowledgeComponent.setPInitialLearned(item.pInitialLearned());
            knowledgeComponent.setPTransition(item.pTransition());
            knowledgeComponent.setPGuess(item.pGuess());
            knowledgeComponent.setPSlip(item.pSlip());
            knowledgeComponent.setActive(true);
            KnowledgeComponent saved = knowledgeComponentRepository.save(knowledgeComponent);
            knowledgeComponentsByName.put(saved.getName(), saved);
        }

        for (KcMappingExtractor.ExtractionMapping mapping : payload.mappings()) {
            List<ItemKcMapping> existing = itemKcMappingRepository.findByItemTypeAndItemId(mapping.itemType(), mapping.itemId());
            if (!existing.isEmpty()) {
                itemKcMappingRepository.deleteAll(existing);
            }

            List<ItemKcMapping> toSave = mapping.kcs().stream()
                    .map(kc -> {
                        KnowledgeComponent knowledgeComponent = knowledgeComponentsByName.get(kc.name());
                        if (knowledgeComponent == null) {
                            return null;
                        }
                        ItemKcMapping itemKcMapping = new ItemKcMapping();
                        itemKcMapping.setItemType(mapping.itemType());
                        itemKcMapping.setItemId(mapping.itemId());
                        itemKcMapping.setKcId(knowledgeComponent.getId());
                        itemKcMapping.setWeight(kc.weight() == null ? 1.0 : kc.weight());
                        return itemKcMapping;
                    })
                    .filter(java.util.Objects::nonNull)
                    .toList();

            itemKcMappingRepository.saveAll(toSave);
        }
    }

    public record SeedPayload(
            List<KcMappingExtractor.ExtractedKnowledgeComponent> knowledgeComponents,
            List<KcMappingExtractor.ExtractionMapping> mappings
    ) {
    }
}
