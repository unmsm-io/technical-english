package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record DiagnosticSubmitRequest(
        @NotEmpty(message = "Las respuestas son obligatorias")
        List<Integer> responses
) {}
