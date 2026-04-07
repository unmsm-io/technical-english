package pe.edu.unmsm.fisi.techeng.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record RejectRequest(@NotBlank String reason) {
}
