package pe.edu.unmsm.fisi.techeng.practice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(nullable = false)
    private Boolean correct = false;

    @Column
    private Double score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttemptStatus status = AttemptStatus.COMPLETED;

    private LocalDateTime completedAt;
}
