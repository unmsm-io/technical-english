package pe.edu.unmsm.fisi.techeng.user.dto;

import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id,
        String codigo,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        String faculty,
        String englishLevel,
        List<String> targetSkills,
        Integer vocabularySize,
        Boolean diagnosticCompleted,
        LocalDateTime diagnosticCompletedAt,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
