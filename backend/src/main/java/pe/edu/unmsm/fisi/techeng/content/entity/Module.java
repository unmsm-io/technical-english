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
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Module extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false, length = 5)
    private String level;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<Lesson> lessons = new ArrayList<>();
}
