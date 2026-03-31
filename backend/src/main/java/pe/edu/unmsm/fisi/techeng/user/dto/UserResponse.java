package pe.edu.unmsm.fisi.techeng.user.dto;

import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String codigo,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        String faculty,
        String englishLevel,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
