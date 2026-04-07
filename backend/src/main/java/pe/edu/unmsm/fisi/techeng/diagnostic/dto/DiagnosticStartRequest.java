package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import jakarta.validation.constraints.NotNull;

public record DiagnosticStartRequest(
        @NotNull(message = "El usuario es obligatorio")
        Long userId
) {}
