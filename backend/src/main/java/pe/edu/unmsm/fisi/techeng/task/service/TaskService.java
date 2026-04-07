package pe.edu.unmsm.fisi.techeng.task.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskDetailResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskGlossResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskStatsResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskTypeResponse;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.mapper.TaskMapper;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.mapper.VocabularyMapper;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final VocabularyRepository vocabularyRepository;
    private final VocabularyMapper vocabularyMapper;
    private final TaskMapper taskMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<TaskResponse> search(TaskType type, CefrLevel cefrLevel, String query, Pageable pageable) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        return taskRepository.search(type, cefrLevel, normalizedQuery, pageable)
                .map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskDetailResponse getById(Long id) {
        Task task = taskRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return taskMapper.toDetailResponse(
                task,
                readGlosses(task.getPreTaskGlossesJson()),
                readVocabularyItems(task.getPreTaskVocabIds())
        );
    }

    @Transactional(readOnly = true)
    public List<TaskTypeResponse> getTypes() {
        return Arrays.stream(TaskType.values())
                .map(taskMapper::toTypeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getStats() {
        Map<String, Long> byType = new LinkedHashMap<>();
        for (TaskType taskType : TaskType.values()) {
            byType.put(taskType.name(), taskRepository.countByTaskType(taskType));
        }

        Map<String, Long> byLevel = new LinkedHashMap<>();
        for (CefrLevel cefrLevel : CefrLevel.values()) {
            byLevel.put(cefrLevel.name(), taskRepository.countByCefrLevel(cefrLevel));
        }

        return new TaskStatsResponse(byType, byLevel, taskRepository.count(), 0);
    }

    private List<TaskGlossResponse> readGlosses(String glossesJson) {
        try {
            return objectMapper.readValue(glossesJson, new TypeReference<>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer los micro-glosses de la tarea", exception);
        }
    }

    private List<VocabularyResponse> readVocabularyItems(String vocabIds) {
        if (vocabIds == null || vocabIds.isBlank()) {
            return List.of();
        }

        List<Long> orderedIds = Arrays.stream(vocabIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(Long::parseLong)
                .toList();

        Map<Long, VocabularyItem> itemById = vocabularyRepository.findAllById(orderedIds).stream()
                .collect(java.util.stream.Collectors.toMap(VocabularyItem::getId, item -> item));

        return orderedIds.stream()
                .map(itemById::get)
                .filter(java.util.Objects::nonNull)
                .map(vocabularyMapper::toResponse)
                .toList();
    }
}
