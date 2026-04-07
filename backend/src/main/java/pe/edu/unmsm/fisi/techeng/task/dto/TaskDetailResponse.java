package pe.edu.unmsm.fisi.techeng.task.dto;

import java.util.List;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;

public record TaskDetailResponse(
        Long id,
        TaskType taskType,
        CefrLevel cefrLevel,
        String titleEs,
        String descriptionEs,
        String preTaskContextEn,
        List<TaskGlossResponse> preTaskGlosses,
        List<VocabularyResponse> vocabularyItems,
        String duringTaskPromptEn,
        String duringTaskInstructionEs,
        String expectedAnswerEn,
        String postTaskLanguageFocus,
        String postTaskExplanationEs
) {}
