package pe.edu.unmsm.fisi.techeng.portfolio.service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.portfolio.dto.PortfolioDtos;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TextProfiler;

@Component
public class PortfolioGrowthAnalyzer {

    private final TextProfiler textProfiler;

    public PortfolioGrowthAnalyzer(TextProfiler textProfiler) {
        this.textProfiler = textProfiler;
    }

    public List<PortfolioDtos.GrowthHighlight> analyze(List<PortfolioGrowthSample> attempts) {
        Map<TaskType, List<PortfolioGrowthSample>> groupedAttempts = new LinkedHashMap<>();
        for (PortfolioGrowthSample attempt : attempts) {
            if (attempt.answerEn() == null || attempt.answerEn().isBlank()) {
                continue;
            }
            groupedAttempts.computeIfAbsent(attempt.taskType(), ignored -> new ArrayList<>()).add(attempt);
        }

        List<PortfolioDtos.GrowthHighlight> highlights = new ArrayList<>();
        for (Map.Entry<TaskType, List<PortfolioGrowthSample>> entry : groupedAttempts.entrySet()) {
            List<PortfolioGrowthSample> values = entry.getValue().stream()
                    .sorted(Comparator.comparing(PortfolioGrowthSample::startedAt))
                    .toList();
            if (values.size() < 2) {
                continue;
            }

            PortfolioGrowthSample first = values.getFirst();
            PortfolioGrowthSample last = values.getLast();
            int beforeCount = textProfiler.profile(first.answerEn()).protectedTokens().size();
            int afterCount = textProfiler.profile(last.answerEn()).protectedTokens().size();
            int delta = afterCount - beforeCount;
            if (delta <= 0) {
                continue;
            }

            highlights.add(new PortfolioDtos.GrowthHighlight(
                    titleFor(entry.getKey()),
                    phraseFor(first, beforeCount),
                    phraseFor(last, afterCount),
                    last.startedAt().atZone(ZoneId.systemDefault()).toInstant(),
                    delta
            ));
        }

        return highlights;
    }

    private String titleFor(TaskType taskType) {
        return switch (taskType) {
            case ERROR_MESSAGE -> "Mensajes de error";
            case API_DOC -> "Documentación de API";
            case COMMIT_MSG -> "Commits";
            case PR_DESC -> "Descripciones de PR";
            case CODE_REVIEW -> "Code reviews";
            case TECH_REPORT -> "Reportes técnicos";
        };
    }

    private String phraseFor(PortfolioGrowthSample attempt, int protectedCount) {
        Instant instant = attempt.startedAt().atZone(ZoneId.systemDefault()).toInstant();
        String month = instant.atZone(ZoneId.systemDefault())
                .getMonth()
                .getDisplayName(TextStyle.FULL, new Locale("es", "PE"));
        return "En %s usabas %d términos técnicos protegidos".formatted(month, protectedCount);
    }

    public record PortfolioGrowthSample(
            TaskType taskType,
            java.time.LocalDateTime startedAt,
            String answerEn
    ) {}
}
