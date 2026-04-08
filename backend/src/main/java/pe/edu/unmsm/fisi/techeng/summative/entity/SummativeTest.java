package pe.edu.unmsm.fisi.techeng.summative.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

/**
 * End-of-module integrated assessment per Douglas (2000) Assessing Languages for Specific
 * Purposes. 3-phase structure (reading + production + comprehension) maps to authentic
 * engineering communication tasks. Closed-book MCQ comprehension validated by REFLECTIONS
 * Chulalongkorn (2024).
 */
@Entity
@Table(
        name = "summative_tests",
        indexes = {
                @Index(name = "idx_summative_tests_type_level", columnList = "taskType,cefrLevel"),
                @Index(name = "idx_summative_tests_active", columnList = "active")
        }
)
public class SummativeTest extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private CefrLevel cefrLevel;

    @Column(nullable = false)
    private String titleEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descriptionEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String readingSpecEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String readingContextEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String productionInstructionEs;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String productionExpectedAnswerEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comprehensionQuestionsJson;

    @Column(nullable = false)
    private Integer passingScore = 60;

    @Column(nullable = false)
    private Boolean active = Boolean.TRUE;

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

    public String getReadingSpecEn() {
        return readingSpecEn;
    }

    public void setReadingSpecEn(String readingSpecEn) {
        this.readingSpecEn = readingSpecEn;
    }

    public String getReadingContextEs() {
        return readingContextEs;
    }

    public void setReadingContextEs(String readingContextEs) {
        this.readingContextEs = readingContextEs;
    }

    public String getProductionInstructionEs() {
        return productionInstructionEs;
    }

    public void setProductionInstructionEs(String productionInstructionEs) {
        this.productionInstructionEs = productionInstructionEs;
    }

    public String getProductionExpectedAnswerEn() {
        return productionExpectedAnswerEn;
    }

    public void setProductionExpectedAnswerEn(String productionExpectedAnswerEn) {
        this.productionExpectedAnswerEn = productionExpectedAnswerEn;
    }

    public String getComprehensionQuestionsJson() {
        return comprehensionQuestionsJson;
    }

    public void setComprehensionQuestionsJson(String comprehensionQuestionsJson) {
        this.comprehensionQuestionsJson = comprehensionQuestionsJson;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
