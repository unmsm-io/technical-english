package pe.edu.unmsm.fisi.techeng.task.mapper;

import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskDetailResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskGlossResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskResponse;
import pe.edu.unmsm.fisi.techeng.task.dto.TaskTypeResponse;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTaskType(),
                task.getCefrLevel(),
                task.getTitleEs(),
                task.getDescriptionEs()
        );
    }

    public TaskDetailResponse toDetailResponse(
            Task task,
            List<TaskGlossResponse> glosses,
            List<VocabularyResponse> vocabularyItems
    ) {
        return new TaskDetailResponse(
                task.getId(),
                task.getTaskType(),
                task.getCefrLevel(),
                task.getTitleEs(),
                task.getDescriptionEs(),
                task.getPreTaskContextEn(),
                glosses,
                vocabularyItems,
                task.getDuringTaskPromptEn(),
                task.getDuringTaskInstructionEs(),
                task.getExpectedAnswerEn(),
                task.getPostTaskLanguageFocus(),
                task.getPostTaskExplanationEs()
        );
    }

    public TaskTypeResponse toTypeResponse(TaskType taskType) {
        return new TaskTypeResponse(taskType.name(), taskType.getDisplayNameEs());
    }
}
