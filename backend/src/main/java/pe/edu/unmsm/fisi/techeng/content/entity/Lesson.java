package pe.edu.unmsm.fisi.techeng.content.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Integer estimatedMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonType type = LessonType.THEORY;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> resources = new ArrayList<>();
}
