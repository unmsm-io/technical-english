package pe.edu.unmsm.fisi.techeng.task.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Test
    void list_shouldFilterByTypeAndQuery() throws Exception {
        assertThat(taskRepository.count()).isEqualTo(5);

        mockMvc.perform(get("/api/v1/tasks")
                        .param("type", "ERROR_MESSAGE")
                        .param("q", "NullPointerException")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].taskType").value("ERROR_MESSAGE"))
                .andExpect(jsonPath("$.data.content[0].titleEs").value("Explicar un NullPointerException en Spring Boot"));
    }

    @Test
    void getById_shouldReturnDetailWithGlossesAndVocabulary() throws Exception {
        Task task = taskRepository.findAll().stream()
                .filter(item -> item.getTaskType().name().equals("API_DOC"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/v1/tasks/{id}", task.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskType").value("API_DOC"))
                .andExpect(jsonPath("$.data.preTaskGlosses.length()").value(2))
                .andExpect(jsonPath("$.data.vocabularyItems.length()").isNumber())
                .andExpect(jsonPath("$.data.duringTaskInstructionEs").isNotEmpty())
                .andExpect(jsonPath("$.data.postTaskExplanationEs").isNotEmpty());
    }

    @Test
    void getTypesAndStats_shouldReturnAggregates() throws Exception {
        mockMvc.perform(get("/api/v1/tasks/types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(6))
                .andExpect(jsonPath("$.data[0].displayNameEs").isNotEmpty());

        mockMvc.perform(get("/api/v1/tasks/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalTasks").value(5))
                .andExpect(jsonPath("$.data.totalAttempts").value(0))
                .andExpect(jsonPath("$.data.byType.ERROR_MESSAGE").value(1))
                .andExpect(jsonPath("$.data.byLevel.A2").value(2))
                .andExpect(jsonPath("$.data.byLevel.B1").value(2))
                .andExpect(jsonPath("$.data.byLevel.B2").value(1));
    }
}
