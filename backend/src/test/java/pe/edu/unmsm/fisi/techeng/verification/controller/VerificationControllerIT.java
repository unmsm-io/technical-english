package pe.edu.unmsm.fisi.techeng.verification.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.verification.dto.ApproveRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemDetailResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.GeneratedItemResponse;
import pe.edu.unmsm.fisi.techeng.verification.dto.GenerationRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.RejectRequest;
import pe.edu.unmsm.fisi.techeng.verification.dto.VerificationMetricsResponse;
import pe.edu.unmsm.fisi.techeng.verification.entity.BloomLevel;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItem;
import pe.edu.unmsm.fisi.techeng.verification.entity.GeneratedItemState;
import pe.edu.unmsm.fisi.techeng.verification.mapper.VerificationMapper;
import pe.edu.unmsm.fisi.techeng.verification.service.GeneratedItemService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VerificationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VerificationMapper verificationMapper;

    @MockBean
    private GeneratedItemService generatedItemService;

    @Test
    void shouldExposeVerificationEndpoints() throws Exception {
        GeneratedItem item = sampleItem();
        GeneratedItemResponse response = verificationMapper.toResponse(item);
        GeneratedItemDetailResponse detail = new GeneratedItemDetailResponse(
                1L, 1L, GeneratedItemState.PENDING_REVIEW, CefrLevel.B1, DiagnosticSkill.READING, BloomLevel.APPLY,
                "NullPointerException", "Question", List.of("A", "B"), 0, "Explanation", List.of("NullPointerException"),
                1.0d, "ok", 1.0d, "ok", 1.0d, "ok", true, "ok", 1.0d, null, null, null, null, List.of(), item.getCreatedAt(), item.getUpdatedAt()
        );

        when(generatedItemService.requestGeneration(eq(1L), any())).thenReturn(item);
        when(generatedItemService.listPendingReview(eq(GeneratedItemState.PENDING_REVIEW), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 20), 1));
        when(generatedItemService.getResponseBundle(1L)).thenReturn(new GeneratedItemService.GeneratedItemResponseBundle(response, detail));
        when(generatedItemService.approve(1L, 9L)).thenReturn(item);
        when(generatedItemService.getMetrics()).thenReturn(new VerificationMetricsResponse(5, 3, 1, 1, 0.6d, java.util.Map.of("factual", 1L), 0.82d, 2));

        mockMvc.perform(post("/api/v1/verification/generate")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GenerationRequest(1L, CefrLevel.B1, DiagnosticSkill.READING, BloomLevel.APPLY, "NullPointerException"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.state").value("PENDING_REVIEW"));

        mockMvc.perform(get("/api/v1/verification/items").param("state", "PENDING_REVIEW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1));

        mockMvc.perform(get("/api/v1/verification/items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));

        mockMvc.perform(post("/api/v1/verification/items/1/approve")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ApproveRequest(9L))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/verification/items/1/reject")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RejectRequest("Needs review"))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/verification/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalGenerated").value(5));
    }

    private GeneratedItem sampleItem() {
        GeneratedItem item = new GeneratedItem();
        item.setId(1L);
        item.setRequestedBy(1L);
        item.setState(GeneratedItemState.PENDING_REVIEW);
        item.setTargetCefrLevel(CefrLevel.B1);
        item.setTargetSkill(DiagnosticSkill.READING);
        item.setBloomLevel(BloomLevel.APPLY);
        item.setTopicHint("NullPointerException");
        item.setQuestionTextEn("Question");
        item.setOptionsJson("[\"A\",\"B\"]");
        item.setCorrectAnswerIdx(0);
        item.setExplanationEn("Explanation");
        item.setProtectedTokensInQuestion("[\"NullPointerException\"]");
        item.setSolvabilityScore(1.0d);
        item.setFactualScore(1.0d);
        item.setReasoningScore(1.0d);
        item.setTokenPreservationOk(true);
        item.setOverallScore(1.0d);
        item.setCreatedAt(java.time.LocalDateTime.now());
        item.setUpdatedAt(java.time.LocalDateTime.now());
        return item;
    }
}
