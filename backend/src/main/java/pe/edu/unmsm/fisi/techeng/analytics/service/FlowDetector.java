package pe.edu.unmsm.fisi.techeng.analytics.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.analytics.dto.FlowState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcResponseLogRepository;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;

/**
 * Csikszentmihalyi (1990) flow theory: optimal challenge-skill balance.
 * Simplified heuristic adaptation: too many AGAIN reviews → frustration zone,
 * too many EASY → boredom zone, balanced 60-85% correct rate → flow.
 * Anti-gamification per Almeida et al. (2023) systematic mapping: avoid
 * leaderboards and disconnected badges, surface meaningful state instead.
 */
@Component
@RequiredArgsConstructor
public class FlowDetector {

    private final ReviewLogRepository reviewLogRepository;
    private final KcResponseLogRepository kcResponseLogRepository;

    public FlowState detect(Long userId) {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        List<ReviewLog> reviewLogs = reviewLogRepository.findReviewedSince(userId, since);
        List<KcResponseLog> kcLogs = kcResponseLogRepository.findByUserIdAndRespondedAtAfter(userId, since);

        long consecutiveAgains = countTail(reviewLogs, ReviewGrade.AGAIN);
        long consecutiveEasys = countTail(reviewLogs, ReviewGrade.EASY);
        long correctResponses = reviewLogs.stream().filter(log -> log.getGrade() != ReviewGrade.AGAIN).count()
                + kcLogs.stream().filter(KcResponseLog::isCorrect).count();
        long totalAttempts = reviewLogs.size() + kcLogs.size();
        double correctRate = totalAttempts == 0 ? 0.0 : (double) correctResponses / totalAttempts;

        String state = "NEUTRAL";
        String message = "Tu ritmo actual es estable, pero todavía no muestra un patrón claro.";
        String recommendation = "Sigue practicando con dificultad moderada y revisa tu progreso al final del día.";

        if (consecutiveAgains >= 3) {
            state = "FRUSTRATION";
            message = "Demasiados errores seguidos: estás en una zona de frustración.";
            recommendation = "Baja la dificultad, repasa vocabulario clave o toma una pausa corta.";
        } else if (consecutiveEasys >= 10) {
            state = "BOREDOM";
            message = "Las últimas respuestas fueron demasiado fáciles: podrías estar en aburrimiento.";
            recommendation = "Sube el reto con tareas nuevas o KCs menos dominados.";
        } else if (totalAttempts == 0) {
            state = "INACTIVE";
            message = "No hay actividad reciente para estimar tu estado de flow.";
            recommendation = "Completa una sesión corta de repaso o una tarea técnica.";
        } else if (correctRate >= 0.6 && correctRate <= 0.85) {
            state = "FLOW";
            message = "Estás en zona de flow: el reto y tu nivel están balanceados.";
            recommendation = "Mantén este ritmo y consolida con una tarea más antes de cerrar la sesión.";
        }

        return new FlowState(
                state,
                message,
                recommendation,
                Instant.now(),
                Math.round(correctRate * 100.0) / 100.0,
                totalAttempts,
                consecutiveAgains,
                consecutiveEasys
        );
    }

    private long countTail(List<ReviewLog> logs, ReviewGrade target) {
        long count = 0;
        for (int index = logs.size() - 1; index >= 0; index--) {
            if (logs.get(index).getGrade() != target) {
                break;
            }
            count++;
        }
        return count;
    }
}
