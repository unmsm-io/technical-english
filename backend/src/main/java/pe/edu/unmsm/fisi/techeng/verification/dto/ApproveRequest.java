package pe.edu.unmsm.fisi.techeng.verification.dto;

import jakarta.validation.constraints.NotNull;

public record ApproveRequest(@NotNull Long approvedBy) {
}
