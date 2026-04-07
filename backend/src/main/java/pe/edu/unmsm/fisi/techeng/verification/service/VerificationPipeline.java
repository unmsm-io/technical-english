package pe.edu.unmsm.fisi.techeng.verification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.verification.agent.FactualChecker;
import pe.edu.unmsm.fisi.techeng.verification.agent.GeneratorAgent;
import pe.edu.unmsm.fisi.techeng.verification.agent.ReasoningValidator;
import pe.edu.unmsm.fisi.techeng.verification.agent.SolvabilityVerifier;
import pe.edu.unmsm.fisi.techeng.verification.agent.TokenPreservationGuard;
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.entity.VerificationLog;
import pe.edu.unmsm.fisi.techeng.verification.repository.GeneratedItemRepository;
import pe.edu.unmsm.fisi.techeng.verification.repository.VerificationLogRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;

/**
 * Multi-agent verification pipeline based on Wang & Katsaggelos (2026).
 * Generator + Solvability + Factual + Reasoning + Token Preservation = 4-stage
 * hallucination filter targeting >90% reduction in malformed exercises. Maity
 * et al. (2025) showed few-shot prompting (8+ examples) significantly improves
 * school-level question generation quality.
 */
@Service
public class VerificationPipeline {

    private final GeneratedItemRepository generatedItemRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final GeneratorAgent generatorAgent;
    private final SolvabilityVerifier solvabilityVerifier;
    private final FactualChecker factualChecker;
    private final ReasoningValidator reasoningValidator;
    private final TokenPreservationGuard tokenPreservationGuard;
    private final TokenClassifier tokenClassifier;
    private final ObjectMapper objectMapper;

    public VerificationPipeline(
            GeneratedItemRepository generatedItemRepository,
            VerificationLogRepository verificationLogRepository,
            GeneratorAgent generatorAgent,
            SolvabilityVerifier solvabilityVerifier,
            FactualChecker factualChecker,
            ReasoningValidator reasoningValidator,
            TokenPreservationGuard tokenPreservationGuard,
            TokenClassifier tokenClassifier,
            ObjectMapper objectMapper
    ) {
        this.generatedItemRepository = generatedItemRepository;
        this.verificationLogRepository = verificationLogRepository;
        this.generatorAgent = generatorAgent;
        this.solvabilityVerifier = solvabilityVerifier;
        this.factualChecker = factualChecker;
        this.reasoningValidator = reasoningValidator;
        this.tokenPreservationGuard = tokenPreservationGuard;
        this.tokenClassifier = tokenClassifier;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GeneratedItem runPipeline(GenerationRequest request) {
        GeneratedItem item = new GeneratedItem();
        item.setRequestedBy(request.requestedBy());
        item.setTargetCefrLevel(request.targetCefrLevel());
        item.setTargetSkill(request.targetSkill());
        item.setBloomLevel(request.bloomLevel());
        item.setTopicHint(request.topicHint());
        item.setState(GeneratedItemState.PENDING_GENERATION);
        item = generatedItemRepository.save(item);

        try {
            item.setState(GeneratedItemState.GENERATING);
            generatedItemRepository.save(item);

            GeneratorAgent.GenerationResult generated = generatorAgent.generate(request);
            item.setQuestionTextEn(generated.questionTextEn());
            item.setOptionsJson(writeJson(generated.options()));
            item.setCorrectAnswerIdx(generated.correctAnswerIdx());
            item.setExplanationEn(generated.explanationEn());
            item.setProtectedTokensInQuestion(writeJson(extractProtectedTokens(request.topicHint())));
            item.setState(GeneratedItemState.VERIFYING);
            generatedItemRepository.save(item);
            saveLog(item.getId(), "GeneratorAgent", "PASS", generated.rawResponseJson(), 0L, null);

            AgentResultDtos.SolvabilityResult solvability = solvabilityVerifier.verify(item);
            item.setSolvabilityScore(solvability.score());
            item.setSolvabilityNotes(solvability.notes());
            saveLog(item.getId(), "SolvabilityVerifier", solvability.passed() ? "PASS" : "REJECT", solvability.rawResponseJson(), 0L, solvability.tokensUsed());
            if (!solvability.passed()) {
                item.setRejectionReason("solvability");
                item.setState(GeneratedItemState.REJECTED);
                return generatedItemRepository.save(item);
            }

            AgentResultDtos.FactualResult factual = factualChecker.verify(item);
            item.setFactualScore(factual.score());
            item.setFactualNotes(factual.notes());
            saveLog(item.getId(), "FactualChecker", factual.passed() ? "PASS" : "REJECT", factual.rawResponseJson(), 0L, factual.tokensUsed());
            if (!factual.passed()) {
                item.setRejectionReason("factual");
                item.setState(GeneratedItemState.REJECTED);
                return generatedItemRepository.save(item);
            }

            AgentResultDtos.ReasoningResult reasoning = reasoningValidator.verify(item);
            item.setReasoningScore(reasoning.score());
            item.setReasoningNotes(reasoning.notes());
            saveLog(item.getId(), "ReasoningValidator", reasoning.passed() ? "PASS" : "REJECT", reasoning.rawResponseJson(), 0L, reasoning.tokensUsed());
            if (!reasoning.passed()) {
                item.setRejectionReason("reasoning");
                item.setState(GeneratedItemState.REJECTED);
                return generatedItemRepository.save(item);
            }

            AgentResultDtos.TokenPreservationResult tokenResult = tokenPreservationGuard.verify(item);
            item.setTokenPreservationOk(tokenResult.passed());
            item.setTokenPreservationNotes(tokenResult.notes());
            saveLog(item.getId(), "TokenPreservationGuard", tokenResult.passed() ? "PASS" : "REJECT", tokenResult.rawResponseJson(), 0L, null);
            if (!tokenResult.passed()) {
                item.setRejectionReason("token_preservation");
                item.setState(GeneratedItemState.REJECTED);
                return generatedItemRepository.save(item);
            }

            item.setOverallScore(weightedOverall(
                    item.getSolvabilityScore(),
                    item.getFactualScore(),
                    item.getReasoningScore(),
                    tokenResult.score()
            ));
            item.setState(GeneratedItemState.PENDING_REVIEW);
            return generatedItemRepository.save(item);
        } catch (Exception exception) {
            item.setState(GeneratedItemState.FAILED);
            item.setRejectionReason(exception.getMessage());
            return generatedItemRepository.save(item);
        }
    }

    private double weightedOverall(double solvability, double factual, double reasoning, double token) {
        return (solvability * 0.3d) + (factual * 0.25d) + (reasoning * 0.25d) + (token * 0.2d);
    }

    private void saveLog(Long generatedItemId, String agentName, String verdict, String rawResponseJson, Long latencyMs, Integer tokensUsed) {
        VerificationLog log = new VerificationLog();
        log.setGeneratedItemId(generatedItemId);
        log.setAgentName(agentName);
        log.setVerdict(verdict);
        log.setLatencyMs(latencyMs);
        log.setTokensUsed(tokensUsed);
        log.setRawResponseJson(rawResponseJson);
        verificationLogRepository.save(log);
    }

    private List<String> extractProtectedTokens(String topicHint) {
        if (topicHint == null || topicHint.isBlank()) {
            return List.of();
        }
        return Arrays.stream(topicHint.split("\\s+"))
                .map(token -> token.replaceAll("^[^A-Za-z0-9`_-]+|[^A-Za-z0-9`._-]+$", ""))
                .filter(token -> !token.isBlank())
                .filter(tokenClassifier::isProtected)
                .distinct()
                .toList();
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo serializar el GeneratedItem", exception);
        }
    }
}
