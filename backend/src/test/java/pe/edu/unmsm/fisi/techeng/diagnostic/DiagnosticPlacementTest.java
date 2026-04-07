package pe.edu.unmsm.fisi.techeng.diagnostic;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.diagnostic.service.DiagnosticService;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

class DiagnosticPlacementTest {

    private final DiagnosticService diagnosticService = new DiagnosticService(null, null, null, new ObjectMapper(), null, null);

    @Test
    void shouldDefaultToA1WhenNoLevelReachesThreshold() {
        CefrLevel placement = diagnosticService.computePlacement(items(), List.of(
                0, 1, 0,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1
        ));

        assertThat(placement).isEqualTo(CefrLevel.A1);
    }

    @Test
    void shouldPlaceAtB1WhenThreeLevelsReachTwoCorrectAnswers() {
        CefrLevel placement = diagnosticService.computePlacement(items(), List.of(
                1, 1, 0,
                1, 1, 0,
                1, 1, 0,
                0, 0, 0,
                0, 0, 0
        ));

        assertThat(placement).isEqualTo(CefrLevel.B1);
    }

    @Test
    void shouldPlaceAtC1WhenAllFiveLevelsMeetThreshold() {
        CefrLevel placement = diagnosticService.computePlacement(items(), List.of(
                1, 1, 0,
                1, 1, 0,
                1, 1, 0,
                1, 1, 0,
                1, 1, 0
        ));

        assertThat(placement).isEqualTo(CefrLevel.C1);
    }

    private List<DiagnosticItem> items() {
        return List.of(
                item(CefrLevel.A1), item(CefrLevel.A1), item(CefrLevel.A1),
                item(CefrLevel.A2), item(CefrLevel.A2), item(CefrLevel.A2),
                item(CefrLevel.B1), item(CefrLevel.B1), item(CefrLevel.B1),
                item(CefrLevel.B2), item(CefrLevel.B2), item(CefrLevel.B2),
                item(CefrLevel.C1), item(CefrLevel.C1), item(CefrLevel.C1)
        );
    }

    private DiagnosticItem item(CefrLevel level) {
        DiagnosticItem item = new DiagnosticItem();
        item.setCefrLevel(level);
        item.setSkill(DiagnosticSkill.READING);
        item.setQuestionText("question");
        item.setOptionsJson("[]");
        item.setCorrectAnswerIdx(1);
        item.setExplanationEs("explanation");
        return item;
    }
}
