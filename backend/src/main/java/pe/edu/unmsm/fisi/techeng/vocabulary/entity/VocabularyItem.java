package pe.edu.unmsm.fisi.techeng.vocabulary.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@Entity
@Table(
        name = "vocabulary_items",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_vocabulary_term_layer", columnNames = {"term", "layer"})
        },
        indexes = {
                @Index(name = "idx_vocabulary_term", columnList = "term"),
                @Index(name = "idx_vocabulary_layer", columnList = "layer"),
                @Index(name = "idx_vocabulary_cefr", columnList = "cefrLevel")
        }
)
public class VocabularyItem extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String term;

    @Column(nullable = false, length = 500)
    private String definition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CefrLevel cefrLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VocabularyLayer layer;

    @Column(nullable = false)
    private Integer frequency;

    @Column(nullable = false, length = 50)
    private String partOfSpeech;

    @Column(nullable = false, length = 500)
    private String exampleSentence;

    @Column(nullable = false)
    private Boolean protectedToken = false;

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public CefrLevel getCefrLevel() {
        return cefrLevel;
    }

    public void setCefrLevel(CefrLevel cefrLevel) {
        this.cefrLevel = cefrLevel;
    }

    public VocabularyLayer getLayer() {
        return layer;
    }

    public void setLayer(VocabularyLayer layer) {
        this.layer = layer;
    }

    public Integer getFrequency() {
        return frequency;
    }

    public void setFrequency(Integer frequency) {
        this.frequency = frequency;
    }

    public String getPartOfSpeech() {
        return partOfSpeech;
    }

    public void setPartOfSpeech(String partOfSpeech) {
        this.partOfSpeech = partOfSpeech;
    }

    public String getExampleSentence() {
        return exampleSentence;
    }

    public void setExampleSentence(String exampleSentence) {
        this.exampleSentence = exampleSentence;
    }

    public Boolean getProtectedToken() {
        return protectedToken;
    }

    public void setProtectedToken(Boolean protectedToken) {
        this.protectedToken = protectedToken;
    }
}
