package pe.edu.unmsm.fisi.techeng.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.edu.unmsm.fisi.techeng.shared.entity.BaseEntity;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_codigo", columnList = "codigo", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.STUDENT;

    @Column(length = 50)
    private String faculty;

    @Column(length = 5)
    private String englishLevel;

    @Column(length = 300)
    private String targetSkills;

    private Integer vocabularySize;

    @Column(nullable = false)
    private Boolean diagnosticCompleted = false;

    private LocalDateTime diagnosticCompletedAt;

    @Column(nullable = false)
    private Boolean active = true;
}
