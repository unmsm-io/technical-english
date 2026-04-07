package pe.edu.unmsm.fisi.techeng.verification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.mapper.VerificationMapper;
import pe.edu.unmsm.fisi.techeng.verification.repository.GeneratedItemRepository;
import pe.edu.unmsm.fisi.techeng.verification.repository.VerificationLogRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;

@ExtendWith(MockitoExtension.class)
class GeneratedItemServiceTest {

    @Mock
    private GeneratedItemRepository generatedItemRepository;

    @Mock
    private VerificationLogRepository verificationLogRepository;

    @Mock
    private DiagnosticItemRepository diagnosticItemRepository;

    @Mock
    private VerificationPipeline verificationPipeline;

    private GeneratedItemService service;

    @BeforeEach
    void setUp() {
        service = new GeneratedItemService(
                generatedItemRepository,
                verificationLogRepository,
                diagnosticItemRepository,
                verificationPipeline,
                new VerificationMapper(new ObjectMapper())
        );
    }

    @Test
    void approve_shouldPromoteToDiagnosticItem() {
        GeneratedItem item = new GeneratedItem();
        item.setId(9L);
        item.setState(GeneratedItemState.PENDING_REVIEW);
        item.setQuestionTextEn("Question");
        item.setOptionsJson("[\"A\",\"B\"]");
        item.setCorrectAnswerIdx(0);
        item.setExplanationEn("Explanation");
        item.setTargetCefrLevel(pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel.B1);
        item.setTargetSkill(pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill.READING);

        when(generatedItemRepository.findById(9L)).thenReturn(Optional.of(item));
        when(diagnosticItemRepository.save(any(DiagnosticItem.class))).thenAnswer(invocation -> {
            DiagnosticItem diagnosticItem = invocation.getArgument(0);
            diagnosticItem.setId(101L);
            return diagnosticItem;
        });
        when(generatedItemRepository.save(any(GeneratedItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GeneratedItem approved = service.approve(9L, 5L);

        assertThat(approved.getState()).isEqualTo(GeneratedItemState.APPROVED);
        assertThat(approved.getPromotedToDiagnosticItemId()).isEqualTo(101L);
        assertThat(approved.getApprovedBy()).isEqualTo(5L);
    }
}
