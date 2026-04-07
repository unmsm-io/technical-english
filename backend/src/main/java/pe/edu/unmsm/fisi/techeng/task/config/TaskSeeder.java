package pe.edu.unmsm.fisi.techeng.task.config;

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
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;

@Component
@RequiredArgsConstructor
public class TaskSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(TaskSeeder.class);

    private final TaskRepository taskRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (taskRepository.count() > 0) {
            logger.info("Task seed skipped because the table already contains data");
            return;
        }

        List<TaskSeedItem> items = readSeedItems();
        taskRepository.saveAll(items.stream().map(this::toEntity).toList());
        logger.info("Loaded {} TBLT tasks across {} types", items.size(), items.stream().map(TaskSeedItem::taskType).distinct().count());
    }

    private List<TaskSeedItem> readSeedItems() throws IOException {
        ClassPathResource resource = new ClassPathResource("seeds/tasks/items.json");
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, new TypeReference<>() {});
        }
    }

    private Task toEntity(TaskSeedItem item) {
        Task task = new Task();
        task.setTaskType(item.taskType());
        task.setCefrLevel(item.cefrLevel());
        task.setTitleEs(item.titleEs());
        task.setDescriptionEs(item.descriptionEs());
        task.setPreTaskContextEn(item.preTaskContextEn());
        task.setPreTaskGlossesJson(item.preTaskGlossesJson());
        task.setPreTaskVocabIds(normalizeVocabularyIds(item.preTaskVocabIds()));
        task.setDuringTaskPromptEn(item.duringTaskPromptEn());
        task.setDuringTaskInstructionEs(item.duringTaskInstructionEs());
        task.setExpectedAnswerEn(item.expectedAnswerEn());
        task.setPostTaskLanguageFocus(item.postTaskLanguageFocus());
        task.setPostTaskExplanationEs(item.postTaskExplanationEs());
        task.setActive(true);
        return task;
    }

    private String normalizeVocabularyIds(String vocabularyIds) {
        if (vocabularyIds == null || vocabularyIds.isBlank()) {
            return null;
        }

        return vocabularyIds.trim();
    }

    private record TaskSeedItem(
            TaskType taskType,
            CefrLevel cefrLevel,
            String titleEs,
            String descriptionEs,
            String preTaskContextEn,
            String preTaskGlossesJson,
            String preTaskVocabIds,
            String duringTaskPromptEn,
            String duringTaskInstructionEs,
            String expectedAnswerEn,
            String postTaskLanguageFocus,
            String postTaskExplanationEs
    ) {}
}
