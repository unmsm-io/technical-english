package pe.edu.unmsm.fisi.techeng.diagnostic.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@Entity
@Table(name = "diagnostic_items", indexes = {
        @Index(name = "idx_diagnostic_items_level", columnList = "cefrLevel"),
        @Index(name = "idx_diagnostic_items_skill", columnList = "skill")
})
public class DiagnosticItem extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CefrLevel cefrLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiagnosticSkill skill;

    @Column(nullable = false, length = 1000)
    private String questionText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionsJson;

    @Column(nullable = false)
    private Integer correctAnswerIdx;

    @Column(nullable = false, length = 1000)
    private String explanationEs;

    public CefrLevel getCefrLevel() {
        return cefrLevel;
    }

    public void setCefrLevel(CefrLevel cefrLevel) {
        this.cefrLevel = cefrLevel;
    }

    public DiagnosticSkill getSkill() {
        return skill;
    }

    public void setSkill(DiagnosticSkill skill) {
        this.skill = skill;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public Integer getCorrectAnswerIdx() {
        return correctAnswerIdx;
    }

    public void setCorrectAnswerIdx(Integer correctAnswerIdx) {
        this.correctAnswerIdx = correctAnswerIdx;
    }

    public String getExplanationEs() {
        return explanationEs;
    }

    public void setExplanationEs(String explanationEs) {
        this.explanationEs = explanationEs;
    }
}
