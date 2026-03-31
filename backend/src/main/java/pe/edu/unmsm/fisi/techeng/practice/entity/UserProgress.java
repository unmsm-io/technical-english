package pe.edu.unmsm.fisi.techeng.practice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.content.entity.Lesson;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    private LocalDateTime completedAt;

    public enum ProgressStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
