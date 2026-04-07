package pe.edu.unmsm.fisi.techeng.verification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.agent.FactualChecker;
import pe.edu.unmsm.fisi.techeng.verification.agent.GeneratorAgent;
import pe.edu.unmsm.fisi.techeng.verification.agent.ReasoningValidator;
import pe.edu.unmsm.fisi.techeng.verification.agent.SolvabilityVerifier;
import pe.edu.unmsm.fisi.techeng.verification.agent.TokenPreservationGuard;
import pe.edu.unmsm.fisi.techeng.verification.dto.AgentResultDtos;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.repository.GeneratedItemRepository;
import pe.edu.unmsm.fisi.techeng.verification.repository.VerificationLogRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;

@ExtendWith(MockitoExtension.class)
class VerificationPipelineTest {

    @Mock
    private GeneratedItemRepository generatedItemRepository;

    @Mock
    private VerificationLogRepository verificationLogRepository;

    @Mock
    private GeneratorAgent generatorAgent;

    @Mock
    private SolvabilityVerifier solvabilityVerifier;

    @Mock
    private FactualChecker factualChecker;

    @Mock
    private ReasoningValidator reasoningValidator;

    @Mock
    private TokenPreservationGuard tokenPreservationGuard;

    private VerificationPipeline pipeline;

    @BeforeEach
    void setUp() {
        pipeline = new VerificationPipeline(
                generatedItemRepository,
                verificationLogRepository,
                generatorAgent,
                solvabilityVerifier,
                factualChecker,
                reasoningValidator,
                tokenPreservationGuard,
                new TokenClassifier(),
                new ObjectMapper()
        );
        when(generatedItemRepository.save(any(GeneratedItem.class))).thenAnswer(invocation -> {
            GeneratedItem item = invocation.getArgument(0);
            if (item.getId() == null) {
                item.setId(1L);
            }
            return item;
        });
    }

    @Test
    void runPipeline_shouldFinishPendingReviewOnHappyPath() {
        when(generatorAgent.generate(any())).thenReturn(new GeneratorAgent.GenerationResult(
                "Question",
                List.of("A", "B", "C", "D"),
                0,
                "Explanation",
                "{}"
        ));
        when(solvabilityVerifier.verify(any())).thenReturn(new AgentResultDtos.SolvabilityResult(1.0d, true, "ok", "{}", null));
        when(factualChecker.verify(any())).thenReturn(new AgentResultDtos.FactualResult(1.0d, true, "ok", List.of(), "{}", null));
        when(reasoningValidator.verify(any())).thenReturn(new AgentResultDtos.ReasoningResult(1.0d, true, "ok", "{}", null));
        when(tokenPreservationGuard.verify(any())).thenReturn(new AgentResultDtos.TokenPreservationResult(1.0d, true, "ok", List.of(), "{}"));

        GeneratedItem item = pipeline.runPipeline(request());

        assertThat(item.getState()).isEqualTo(GeneratedItemState.PENDING_REVIEW);
        assertThat(item.getOverallScore()).isEqualTo(1.0d);
    }

    @Test
    void runPipeline_shouldShortCircuitWhenSolvabilityFails() {
        when(generatorAgent.generate(any())).thenReturn(new GeneratorAgent.GenerationResult(
                "Question",
                List.of("A", "B"),
                0,
                "Explanation",
                "{}"
        ));
        when(solvabilityVerifier.verify(any())).thenReturn(new AgentResultDtos.SolvabilityResult(0.0d, false, "bad", "{}", null));

        GeneratedItem item = pipeline.runPipeline(request());

        assertThat(item.getState()).isEqualTo(GeneratedItemState.REJECTED);
        assertThat(item.getRejectionReason()).isEqualTo("solvability");
        verify(factualChecker, never()).verify(any());
    }

    @Test
    void runPipeline_shouldMarkFailedWhenGeneratorThrows() {
        when(generatorAgent.generate(any())).thenThrow(new IllegalStateException("boom"));

        GeneratedItem item = pipeline.runPipeline(request());

        assertThat(item.getState()).isEqualTo(GeneratedItemState.FAILED);
    }

    private GenerationRequest request() {
        return new GenerationRequest(1L, CefrLevel.B1, DiagnosticSkill.READING, BloomLevel.APPLY, "NullPointerException");
    }
}
