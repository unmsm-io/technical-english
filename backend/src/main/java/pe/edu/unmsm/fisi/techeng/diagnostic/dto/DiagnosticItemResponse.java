package pe.edu.unmsm.fisi.techeng.diagnostic.dto;

import java.util.List;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

public record DiagnosticItemResponse(
        Long id,
        CefrLevel cefrLevel,
        DiagnosticSkill skill,
        String questionText,
        List<String> options
) {}
