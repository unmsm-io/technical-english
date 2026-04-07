package pe.edu.unmsm.fisi.techeng.user.mapper;

import pe.edu.unmsm.fisi.techeng.user.dto.CreateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserResponse;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(CreateUserRequest request) {
        var user = new User();
        user.setCodigo(request.codigo());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(request.role() != null ? request.role() : UserRole.STUDENT);
        user.setFaculty(request.faculty());
        user.setEnglishLevel(request.englishLevel());
        user.setTargetSkills(joinSkills(request.targetSkills()));
        user.setVocabularySize(request.vocabularySize());
        user.setDiagnosticCompleted(request.diagnosticCompleted() != null ? request.diagnosticCompleted() : Boolean.FALSE);
        user.setDiagnosticCompletedAt(request.diagnosticCompletedAt());
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getCodigo(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getFaculty(),
                user.getEnglishLevel(),
                splitSkills(user.getTargetSkills()),
                user.getVocabularySize(),
                user.getDiagnosticCompleted(),
                user.getDiagnosticCompletedAt(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public String joinSkills(List<String> targetSkills) {
        if (targetSkills == null || targetSkills.isEmpty()) {
            return null;
        }
        return targetSkills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .distinct()
                .reduce((left, right) -> left + "," + right)
                .orElse(null);
    }

    public List<String> splitSkills(String targetSkills) {
        if (targetSkills == null || targetSkills.isBlank()) {
            return List.of();
        }
        return Arrays.stream(targetSkills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .toList();
    }
}
