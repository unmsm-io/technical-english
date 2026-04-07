package pe.edu.unmsm.fisi.techeng.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;

public record CreateUserRequest(
        @NotBlank(message = "Código is required")
        @Size(max = 20)
        String codigo,

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100)
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100)
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        UserRole role,

        String faculty,

        @Pattern(regexp = "^(A1|A2|B1|B2|C1|C2)?$", message = "English level must be A1, A2, B1, B2, C1, or C2")
        String englishLevel,

        List<String> targetSkills,

        Integer vocabularySize,

        Boolean diagnosticCompleted,

        LocalDateTime diagnosticCompletedAt
) {
    public CreateUserRequest(
            String codigo,
            String firstName,
            String lastName,
            String email,
            String password,
            UserRole role,
            String faculty,
            String englishLevel
    ) {
        this(codigo, firstName, lastName, email, password, role, faculty, englishLevel, null, null, null, null);
    }
}
