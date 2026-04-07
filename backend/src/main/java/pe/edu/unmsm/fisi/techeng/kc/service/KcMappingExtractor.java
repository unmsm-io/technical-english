package pe.edu.unmsm.fisi.techeng.kc.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class KcMappingExtractor {

    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper;
    private final DiagnosticItemRepository diagnosticItemRepository;
    private final TaskRepository taskRepository;
    private final VocabularyRepository vocabularyRepository;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model;

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public ExtractionSeedData extractAll() {
        long startedAt = System.currentTimeMillis();
        List<ItemPayload> items = new ArrayList<>();
        diagnosticItemRepository.findAllByOrderByIdAsc().forEach(item -> items.add(fromDiagnostic(item)));
        taskRepository.findAll().forEach(item -> items.add(fromTask(item)));
        vocabularyRepository.findAll(PageRequest.of(0, 100)).forEach(item -> items.add(fromVocabulary(item)));

        RestClient client = restClientBuilder
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        Map<String, ExtractedKnowledgeComponent> uniqueKcs = new LinkedHashMap<>();
        List<ExtractionMapping> mappings = new ArrayList<>();
        List<String> rejectedItems = new ArrayList<>();

        for (ItemPayload item : items) {
            try {
                ExtractionResponse response = extractItem(client, item);
                List<ExtractionKc> normalizedKcs = dedupeKcs(response.kcs());
                for (ExtractionKc kc : normalizedKcs) {
                    uniqueKcs.putIfAbsent(
                            kc.name(),
                            new ExtractedKnowledgeComponent(
                                    kc.name(),
                                    kc.nameEs(),
                                    kc.description(),
                                    kc.category(),
                                    item.cefrLevel(),
                                    0.1,
                                    0.3,
                                    0.2,
                                    0.1
                            )
                    );
                }
                mappings.add(new ExtractionMapping(item.itemType(), item.itemId(), normalizedKcs));
            } catch (Exception exception) {
                log.warn("KC extraction failed for {} {}", item.itemType(), item.itemId(), exception);
                rejectedItems.add(item.itemType() + ":" + item.itemId());
            }
        }

        return new ExtractionSeedData(
                new ArrayList<>(uniqueKcs.values()),
                mappings,
                System.currentTimeMillis() - startedAt,
                rejectedItems
        );
    }

    private ExtractionResponse extractItem(RestClient client, ItemPayload item) throws Exception {
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt()),
                        Map.of("role", "user", "content", userPrompt(item))
                ),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        String response = client.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        JsonNode contentNode = objectMapper.readTree(response)
                .path("choices")
                .get(0)
                .path("message")
                .path("content");

        return objectMapper.readValue(contentNode.asText(), ExtractionResponse.class);
    }

    private String systemPrompt() {
        return """
                You are extracting Knowledge Components from a software English learning item.
                Knowledge components are atomic skill units like "passive_voice", "error_message_reading", "rest_api_documentation", "commit_message_imperative_mood".
                Return strict JSON: {"kcs":[{"name":"snake_case","nameEs":"...","description":"...","category":"GRAMMAR|VOCABULARY|READING_COMPREHENSION|WRITING_GENRE|PRAGMATICS|DISCOURSE","weight":1.0}]}
                """;
    }

    private String userPrompt(ItemPayload item) {
        return """
                Item type: %s
                Item content: %s
                CEFR level: %s
                """.formatted(item.itemType(), item.content(), item.cefrLevel());
    }

    private List<ExtractionKc> dedupeKcs(List<ExtractionKc> kcs) {
        if (kcs == null || kcs.isEmpty()) {
            return List.of();
        }

        Set<String> seen = new LinkedHashSet<>();
        List<ExtractionKc> deduped = new ArrayList<>();
        for (ExtractionKc kc : kcs) {
            if (kc == null || kc.name() == null || kc.name().isBlank()) {
                continue;
            }
            String normalizedName = normalizeName(kc.name());
            if (seen.add(normalizedName)) {
                deduped.add(new ExtractionKc(
                        normalizedName,
                        kc.nameEs() == null || kc.nameEs().isBlank() ? normalizedName : kc.nameEs().trim(),
                        kc.description() == null || kc.description().isBlank() ? normalizedName : kc.description().trim(),
                        kc.category() == null ? KcCategory.VOCABULARY : kc.category(),
                        kc.weight() == null ? 1.0 : kc.weight()
                ));
            }
        }
        return deduped;
    }

    private String normalizeName(String value) {
        return value.trim().toLowerCase().replace(' ', '_');
    }

    private ItemPayload fromDiagnostic(DiagnosticItem item) {
        return new ItemPayload(
                KcItemType.DIAGNOSTIC,
                item.getId(),
                item.getQuestionText() + " " + item.getExplanationEs(),
                item.getCefrLevel().name()
        );
    }

    private ItemPayload fromTask(Task item) {
        return new ItemPayload(
                KcItemType.TASK,
                item.getId(),
                item.getTitleEs() + " " + item.getDuringTaskPromptEn() + " " + item.getPostTaskLanguageFocus(),
                item.getCefrLevel().name()
        );
    }

    private ItemPayload fromVocabulary(VocabularyItem item) {
        return new ItemPayload(
                KcItemType.VOCABULARY,
                item.getId(),
                item.getTerm() + " " + item.getDefinition() + " " + item.getExampleSentence(),
                item.getCefrLevel().name()
        );
    }

    private record ItemPayload(
            KcItemType itemType,
            Long itemId,
            String content,
            String cefrLevel
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ExtractionResponse(List<ExtractionKc> kcs) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ExtractionKc(
            String name,
            String nameEs,
            String description,
            KcCategory category,
            Double weight
    ) {
    }

    public record ExtractedKnowledgeComponent(
            String name,
            String nameEs,
            String description,
            KcCategory category,
            String cefrLevel,
            double pInitialLearned,
            double pTransition,
            double pGuess,
            double pSlip
    ) {
    }

    public record ExtractionMapping(
            KcItemType itemType,
            Long itemId,
            List<ExtractionKc> kcs
    ) {
    }

    public record ExtractionSeedData(
            List<ExtractedKnowledgeComponent> knowledgeComponents,
            List<ExtractionMapping> mappings,
            long durationMs,
            List<String> rejectedItems
    ) {
    }
}
