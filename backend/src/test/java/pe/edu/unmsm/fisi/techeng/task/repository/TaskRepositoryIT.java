package pe.edu.unmsm.fisi.techeng.task.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

@SpringBootTest
@Transactional
class TaskRepositoryIT {

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void search_shouldHandleNullQueryInPostgres() {
        Page<Task> page = taskRepository.search(null, null, null, PageRequest.of(0, 10));

        assertThat(page).isNotNull();
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void search_shouldFilterByTypeLevelAndQuery() {
        Task task = new Task();
        task.setTaskType(TaskType.ERROR_MESSAGE);
        task.setCefrLevel(CefrLevel.B1);
        task.setTitleEs("TaskRepositoryIT unique needle");
        task.setDescriptionEs("Descripcion para validar filtro por consulta");
        task.setPreTaskContextEn("Context");
        task.setPreTaskGlossesJson("[]");
        task.setDuringTaskPromptEn("Prompt");
        task.setDuringTaskInstructionEs("Instruction");
        task.setExpectedAnswerEn("Expected");
        task.setPostTaskLanguageFocus("{\"grammar\":\"simple present\"}");
        task.setPostTaskExplanationEs("Explicacion");
        task.setActive(true);
        taskRepository.save(task);

        Page<Task> page = taskRepository.search(
                TaskType.ERROR_MESSAGE,
                CefrLevel.B1,
                "unique needle",
                PageRequest.of(0, 10)
        );

        assertThat(page.getContent())
                .extracting(Task::getTitleEs)
                .contains("TaskRepositoryIT unique needle");
    }
}
