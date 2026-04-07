package pe.edu.unmsm.fisi.techeng.verification.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemDetailResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.VerificationLogEntry;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.VerificationLog;

@Component
public class VerificationMapper {

    private final ObjectMapper objectMapper;

    public VerificationMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GeneratedItemResponse toResponse(GeneratedItem item) {
        return new GeneratedItemResponse(
                item.getId(),
                item.getState(),
                item.getTargetCefrLevel(),
                item.getTargetSkill(),
                item.getBloomLevel(),
                item.getTopicHint(),
                item.getQuestionTextEn(),
                readStringList(item.getOptionsJson()),
                item.getCorrectAnswerIdx(),
                item.getExplanationEn(),
                item.getSolvabilityScore(),
                item.getFactualScore(),
                item.getReasoningScore(),
                item.getTokenPreservationOk(),
                item.getOverallScore(),
                item.getRejectionReason(),
                item.getPromotedToDiagnosticItemId(),
                item.getCreatedAt()
        );
    }

    public GeneratedItemDetailResponse toDetailResponse(GeneratedItem item, List<VerificationLog> logs) {
        return new GeneratedItemDetailResponse(
                item.getId(),
                item.getRequestedBy(),
                item.getState(),
                item.getTargetCefrLevel(),
                item.getTargetSkill(),
                item.getBloomLevel(),
                item.getTopicHint(),
                item.getQuestionTextEn(),
                readStringList(item.getOptionsJson()),
                item.getCorrectAnswerIdx(),
                item.getExplanationEn(),
                readStringList(item.getProtectedTokensInQuestion()),
                item.getSolvabilityScore(),
                item.getSolvabilityNotes(),
                item.getFactualScore(),
                item.getFactualNotes(),
                item.getReasoningScore(),
                item.getReasoningNotes(),
                item.getTokenPreservationOk(),
                item.getTokenPreservationNotes(),
                item.getOverallScore(),
                item.getRejectionReason(),
                item.getApprovedBy(),
                item.getApprovedAt(),
                item.getPromotedToDiagnosticItemId(),
                logs.stream().map(this::toLogEntry).toList(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public VerificationLogEntry toLogEntry(VerificationLog log) {
        return new VerificationLogEntry(
                log.getId(),
                log.getAgentName(),
                log.getLatencyMs(),
                log.getTokensUsed(),
                log.getVerdict(),
                log.getRawResponseJson(),
                log.getCreatedAt()
        );
    }

    private List<String> readStringList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer el JSON de GeneratedItem", exception);
        }
    }
}
