package pe.edu.unmsm.fisi.techeng.practice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.content.entity.Lesson;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Exercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExerciseType type;

    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty = Difficulty.BEGINNER;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean llmGenerated = false;
}
