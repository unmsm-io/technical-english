package pe.edu.unmsm.fisi.techeng.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.ProfileResult;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TextProfiler;

class PortfolioGrowthAnalyzerTest {

    @Test
    void analyzeShouldProduceGrowthHighlightWhenProtectedVocabularyImproves() {
        TextProfiler textProfiler = Mockito.mock(TextProfiler.class);
        PortfolioGrowthAnalyzer analyzer = new PortfolioGrowthAnalyzer(textProfiler);

        when(textProfiler.profile("Initial answer")).thenReturn(new ProfileResult(
                2,
                List.of("api"),
                List.of("initial"),
                1,
                List.of(),
                50.0,
                false,
                List.of()
        ));
        when(textProfiler.profile("Improved answer")).thenReturn(new ProfileResult(
                3,
                List.of("api", "latency", "throughput"),
                List.of("improved"),
                1,
                List.of(),
                50.0,
                false,
                List.of()
        ));

        List<PortfolioDtos.GrowthHighlight> highlights = analyzer.analyze(List.of(
                new PortfolioGrowthAnalyzer.PortfolioGrowthSample(
                        pe.edu.unmsm.fisi.techeng.task.entity.TaskType.API_DOC,
                        LocalDateTime.of(2026, 1, 10, 9, 0),
                        "Initial answer"
                ),
                new PortfolioGrowthAnalyzer.PortfolioGrowthSample(
                        pe.edu.unmsm.fisi.techeng.task.entity.TaskType.API_DOC,
                        LocalDateTime.of(2026, 3, 12, 9, 0),
                        "Improved answer"
                )
        ));

        assertThat(highlights).hasSize(1);
        assertThat(highlights.getFirst().deltaCount()).isEqualTo(2);
    }
}
