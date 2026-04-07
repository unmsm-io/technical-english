package pe.edu.unmsm.fisi.techeng.task.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

/**
 * TBLT 3-phase task structure follows Ellis (2003/2009) and Long (2015). Pre-task
 * framing + during-task performance + post-task language focus. Technology-mediated
 * task flow for technical English also aligns with Bhandari et al. (2025).
 */
@Entity
@Table(
        name = "tasks",
        indexes = {
                @Index(name = "idx_tasks_type", columnList = "taskType"),
                @Index(name = "idx_tasks_cefr", columnList = "cefrLevel"),
                @Index(name = "idx_tasks_active", columnList = "active")
        }
)
public class Task extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CefrLevel cefrLevel;

    @Column(nullable = false, length = 180)
    private String titleEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descriptionEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String preTaskContextEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String preTaskGlossesJson;

    @Column(columnDefinition = "TEXT")
    private String preTaskVocabIds;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String duringTaskPromptEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String duringTaskInstructionEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedAnswerEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String postTaskLanguageFocus;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String postTaskExplanationEs;

    @Column(nullable = false)
    private Boolean active = true;

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public CefrLevel getCefrLevel() {
        return cefrLevel;
    }

    public void setCefrLevel(CefrLevel cefrLevel) {
        this.cefrLevel = cefrLevel;
    }

    public String getTitleEs() {
        return titleEs;
    }

    public void setTitleEs(String titleEs) {
        this.titleEs = titleEs;
    }

    public String getDescriptionEs() {
        return descriptionEs;
    }

    public void setDescriptionEs(String descriptionEs) {
        this.descriptionEs = descriptionEs;
    }

    public String getPreTaskContextEn() {
        return preTaskContextEn;
    }

    public void setPreTaskContextEn(String preTaskContextEn) {
        this.preTaskContextEn = preTaskContextEn;
    }

    public String getPreTaskGlossesJson() {
        return preTaskGlossesJson;
    }

    public void setPreTaskGlossesJson(String preTaskGlossesJson) {
        this.preTaskGlossesJson = preTaskGlossesJson;
    }

    public String getPreTaskVocabIds() {
        return preTaskVocabIds;
    }

    public void setPreTaskVocabIds(String preTaskVocabIds) {
        this.preTaskVocabIds = preTaskVocabIds;
    }

    public String getDuringTaskPromptEn() {
        return duringTaskPromptEn;
    }

    public void setDuringTaskPromptEn(String duringTaskPromptEn) {
        this.duringTaskPromptEn = duringTaskPromptEn;
    }

    public String getDuringTaskInstructionEs() {
        return duringTaskInstructionEs;
    }

    public void setDuringTaskInstructionEs(String duringTaskInstructionEs) {
        this.duringTaskInstructionEs = duringTaskInstructionEs;
    }

    public String getExpectedAnswerEn() {
        return expectedAnswerEn;
    }

    public void setExpectedAnswerEn(String expectedAnswerEn) {
        this.expectedAnswerEn = expectedAnswerEn;
    }

    public String getPostTaskLanguageFocus() {
        return postTaskLanguageFocus;
    }

    public void setPostTaskLanguageFocus(String postTaskLanguageFocus) {
        this.postTaskLanguageFocus = postTaskLanguageFocus;
    }

    public String getPostTaskExplanationEs() {
        return postTaskExplanationEs;
    }

    public void setPostTaskExplanationEs(String postTaskExplanationEs) {
        this.postTaskExplanationEs = postTaskExplanationEs;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
