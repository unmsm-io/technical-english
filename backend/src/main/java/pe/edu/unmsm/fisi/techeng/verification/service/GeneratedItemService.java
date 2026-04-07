package pe.edu.unmsm.fisi.techeng.verification.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationStatus;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.VerificationMetricsResponse;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.entity.VerificationLog;
import pe.edu.unmsm.fisi.techeng.verification.mapper.VerificationMapper;
import pe.edu.unmsm.fisi.techeng.verification.repository.GeneratedItemRepository;
import pe.edu.unmsm.fisi.techeng.verification.repository.VerificationLogRepository;

@Service
@Transactional
public class GeneratedItemService {

    private final GeneratedItemRepository generatedItemRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final DiagnosticItemRepository diagnosticItemRepository;
    private final VerificationPipeline verificationPipeline;
    private final VerificationMapper verificationMapper;

    public GeneratedItemService(
            GeneratedItemRepository generatedItemRepository,
            VerificationLogRepository verificationLogRepository,
            DiagnosticItemRepository diagnosticItemRepository,
            VerificationPipeline verificationPipeline,
            VerificationMapper verificationMapper
    ) {
        this.generatedItemRepository = generatedItemRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.diagnosticItemRepository = diagnosticItemRepository;
        this.verificationPipeline = verificationPipeline;
        this.verificationMapper = verificationMapper;
    }

    public GeneratedItem requestGeneration(Long requestedBy, GenerationRequest request) {
        if (!requestedBy.equals(request.requestedBy())) {
            throw new BusinessRuleException("El requestedBy del body no coincide con el caller");
        }
        return verificationPipeline.runPipeline(request);
    }

    @Transactional(readOnly = true)
    public Page<GeneratedItem> listPendingReview(GeneratedItemState state, Pageable pageable) {
        if (state == null) {
            return generatedItemRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return generatedItemRepository.findByStateOrderByCreatedAtDesc(state, pageable);
    }

    public GeneratedItem approve(Long id, Long approverId) {
        GeneratedItem item = getEntityById(id);
        if (item.getState() != GeneratedItemState.PENDING_REVIEW) {
            throw new BusinessRuleException("Solo se pueden aprobar items en PENDING_REVIEW");
        }

        DiagnosticItem diagnosticItem = new DiagnosticItem();
        diagnosticItem.setCefrLevel(item.getTargetCefrLevel());
        diagnosticItem.setSkill(item.getTargetSkill());
        diagnosticItem.setQuestionText(item.getQuestionTextEn());
        diagnosticItem.setOptionsJson(item.getOptionsJson());
        diagnosticItem.setCorrectAnswerIdx(item.getCorrectAnswerIdx());
        diagnosticItem.setExplanationEs(item.getExplanationEn());
        diagnosticItem.setLlmGenerated(true);
        diagnosticItem.setDiscrimination(1.0d);
        diagnosticItem.setResponseCount(0);
        diagnosticItem.setCalibrationStatus(CalibrationStatus.UNCALIBRATED);
        DiagnosticItem savedDiagnosticItem = diagnosticItemRepository.save(diagnosticItem);

        item.setPromotedToDiagnosticItemId(savedDiagnosticItem.getId());
        item.setApprovedBy(approverId);
        item.setApprovedAt(Instant.now());
        item.setState(GeneratedItemState.APPROVED);
        return generatedItemRepository.save(item);
    }

    public void reject(Long id, String reason) {
        GeneratedItem item = getEntityById(id);
        item.setState(GeneratedItemState.REJECTED);
        item.setRejectionReason(reason);
        generatedItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public GeneratedItem getById(Long id) {
        return getEntityById(id);
    }

    @Transactional(readOnly = true)
    public List<VerificationLog> getLogs(Long generatedItemId) {
        return verificationLogRepository.findByGeneratedItemIdOrderByCreatedAtAsc(generatedItemId);
    }

    @Transactional(readOnly = true)
    public VerificationMetricsResponse getMetrics() {
        long totalGenerated = generatedItemRepository.count();
        long approvedCount = generatedItemRepository.countByState(GeneratedItemState.APPROVED);
        long rejectedCount = generatedItemRepository.countByState(GeneratedItemState.REJECTED);
        long pendingCount = generatedItemRepository.countByState(GeneratedItemState.PENDING_REVIEW);
        double approvalRate = totalGenerated == 0 ? 0.0d : approvedCount / (double) totalGenerated;

        Map<String, Long> rejectionsByReason = new LinkedHashMap<>();
        generatedItemRepository.findAll().stream()
                .filter(item -> item.getState() == GeneratedItemState.REJECTED)
                .forEach(item -> rejectionsByReason.merge(
                        item.getRejectionReason() == null ? "unspecified" : item.getRejectionReason(),
                        1L,
                        Long::sum
                ));

        Double avgOverallScore = generatedItemRepository.findAll().stream()
                .map(GeneratedItem::getOverallScore)
                .filter(value -> value != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .stream()
                .boxed()
                .findFirst()
                .orElse(null);

        Instant last24hThreshold = Instant.now().minus(24, ChronoUnit.HOURS);
        long last24hCount = generatedItemRepository.findAll().stream()
                .filter(item -> item.getCreatedAt() != null)
                .filter(item -> item.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().isAfter(last24hThreshold))
                .count();

        return new VerificationMetricsResponse(
                totalGenerated,
                approvedCount,
                rejectedCount,
                pendingCount,
                approvalRate,
                rejectionsByReason,
                avgOverallScore,
                last24hCount
        );
    }

    @Transactional(readOnly = true)
    public GeneratedItemResponseBundle getResponseBundle(Long id) {
        GeneratedItem item = getEntityById(id);
        return new GeneratedItemResponseBundle(
                verificationMapper.toResponse(item),
                verificationMapper.toDetailResponse(item, getLogs(id))
        );
    }

    private GeneratedItem getEntityById(Long id) {
        return generatedItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Generated item not found with id: " + id));
    }

    public record GeneratedItemResponseBundle(
            pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemResponse response,
            pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemDetailResponse detail
    ) {
    }
}
