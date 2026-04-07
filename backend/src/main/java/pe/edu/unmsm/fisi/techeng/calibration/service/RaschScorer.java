package pe.edu.unmsm.fisi.techeng.calibration.service;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

/**
 * Rasch (1960) one-parameter logistic IRT model. Probability of correct response
 * P(theta, b) = 1 / (1 + exp(-(theta - b))). Lord (1980) extended to 2-PL and
 * 3-PL with discrimination and guessing parameters.
 */
@Component
public class RaschScorer {

    public double probability(double theta, double difficulty) {
        return probability(theta, difficulty, 1.0d);
    }

    public double probability(double theta, double difficulty, double discrimination) {
        double scaledDifference = clamp(discrimination * (theta - difficulty), -35.0d, 35.0d);
        return 1.0d / (1.0d + Math.exp(-scaledDifference));
    }

    public double information(double theta, double difficulty, double discrimination) {
        double probability = probability(theta, difficulty, discrimination);
        return discrimination * discrimination * probability * (1.0d - probability);
    }

    public double logLikelihood(List<Response> responses, double thetaCandidate, Map<Long, ItemParams> items) {
        double logLikelihood = 0.0d;
        for (Response response : responses) {
            ItemParams itemParams = items.get(response.itemId());
            if (itemParams == null) {
                continue;
            }
            double probability = probability(thetaCandidate, itemParams.difficulty(), itemParams.discrimination());
            double boundedProbability = clamp(probability, 1.0e-9, 1.0d - 1.0e-9);
            logLikelihood += response.correct()
                    ? Math.log(boundedProbability)
                    : Math.log(1.0d - boundedProbability);
        }
        return logLikelihood;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
