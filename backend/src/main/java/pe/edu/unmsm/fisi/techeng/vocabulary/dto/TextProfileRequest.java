package pe.edu.unmsm.fisi.techeng.vocabulary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TextProfileRequest(
        @NotBlank(message = "El texto es obligatorio")
        @Size(max = 10000, message = "El texto no puede exceder 10000 caracteres")
        String text
) {}
