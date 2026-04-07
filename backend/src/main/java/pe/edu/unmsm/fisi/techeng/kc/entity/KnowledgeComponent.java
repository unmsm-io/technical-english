package pe.edu.unmsm.fisi.techeng.kc.entity;

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
        name = "knowledge_components",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_knowledge_components_name", columnNames = "name")
        },
        indexes = {
                @Index(name = "idx_knowledge_components_name", columnList = "name"),
                @Index(name = "idx_knowledge_components_category", columnList = "category"),
                @Index(name = "idx_knowledge_components_cefr", columnList = "cefrLevel")
        }
)
public class KnowledgeComponent extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String nameEs;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private KcCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CefrLevel cefrLevel;

    @Column(nullable = false)
    private double pInitialLearned = 0.1;

    @Column(nullable = false)
    private double pTransition = 0.3;

    @Column(nullable = false)
    private double pGuess = 0.2;

    @Column(nullable = false)
    private double pSlip = 0.1;

    @Column(nullable = false)
    private boolean active = true;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameEs() {
        return nameEs;
    }

    public void setNameEs(String nameEs) {
        this.nameEs = nameEs;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public KcCategory getCategory() {
        return category;
    }

    public void setCategory(KcCategory category) {
        this.category = category;
    }

    public CefrLevel getCefrLevel() {
        return cefrLevel;
    }

    public void setCefrLevel(CefrLevel cefrLevel) {
        this.cefrLevel = cefrLevel;
    }

    public double getPInitialLearned() {
        return pInitialLearned;
    }

    public void setPInitialLearned(double pInitialLearned) {
        this.pInitialLearned = pInitialLearned;
    }

    public double getPTransition() {
        return pTransition;
    }

    public void setPTransition(double pTransition) {
        this.pTransition = pTransition;
    }

    public double getPGuess() {
        return pGuess;
    }

    public void setPGuess(double pGuess) {
        this.pGuess = pGuess;
    }

    public double getPSlip() {
        return pSlip;
    }

    public void setPSlip(double pSlip) {
        this.pSlip = pSlip;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
