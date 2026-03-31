package pe.edu.unmsm.fisi.techeng.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateModuleRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 1000) String description,
        @NotNull Integer displayOrder,
        @NotBlank @Pattern(regexp = "^(A1|A2|B1|B2|C1|C2)$") String level
) {}
