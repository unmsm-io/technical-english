package pe.edu.unmsm.fisi.techeng.user.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserProfileUpdateRequest(
        List<String> targetSkills,
        Integer vocabularySize,
        Boolean diagnosticCompleted,
        LocalDateTime diagnosticCompletedAt
) {}
