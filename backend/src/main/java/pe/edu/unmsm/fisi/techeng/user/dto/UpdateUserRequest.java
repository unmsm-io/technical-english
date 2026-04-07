package pe.edu.unmsm.fisi.techeng.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;

public record UpdateUserRequest(
        @Size(min = 2, max = 100)
        String firstName,

        @Size(min = 2, max = 100)
        String lastName,

        @Email(message = "Email must be valid")
        String email,

        UserRole role,

        String faculty,

        @Pattern(regexp = "^(A1|A2|B1|B2|C1|C2)?$", message = "English level must be A1, A2, B1, B2, C1, or C2")
        String englishLevel,

        List<String> targetSkills,

        Integer vocabularySize,

        Boolean diagnosticCompleted,

        LocalDateTime diagnosticCompletedAt
) {
    public UpdateUserRequest(
            String firstName,
            String lastName,
            String email,
            UserRole role,
            String faculty,
            String englishLevel
    ) {
        this(firstName, lastName, email, role, faculty, englishLevel, null, null, null, null);
    }
}
