package pe.edu.unmsm.fisi.techeng.calibration.service;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

/**
 * Expected A Posteriori (EAP) ability estimation using numerical quadrature.
 * 41-point Gauss-Hermite-style approximation of the posterior over normal prior
 * N(0,1). Standard reference: Bock & Mislevy (1982).
 */
@Component
public class AbilityEstimator {

    private static final int QUADRATURE_POINTS = 41;
    private static final double THETA_MIN = -4.0d;
    private static final double THETA_MAX = 4.0d;
    private static final double STEP = (THETA_MAX - THETA_MIN) / (QUADRATURE_POINTS - 1);
    private static final double SQRT_TWO_PI = Math.sqrt(2.0d * Math.PI);

    private final RaschScorer raschScorer;

    public AbilityEstimator(RaschScorer raschScorer) {
        this.raschScorer = raschScorer;
    }

    public EapEstimate estimateTheta(List<Response> responses, Map<Long, ItemParams> items) {
        if (responses == null || responses.isEmpty() || items == null || items.isEmpty()) {
            return new EapEstimate(0.0d, 1.0d, 1.0d);
        }

        double posteriorWeightSum = 0.0d;
        double weightedThetaSum = 0.0d;
        double weightedThetaSquaredSum = 0.0d;

        for (int index = 0; index < QUADRATURE_POINTS; index++) {
            double theta = THETA_MIN + (index * STEP);
            double logPosterior = raschScorer.logLikelihood(responses, theta, items) + logNormalPrior(theta);
            double posteriorWeight = Math.exp(logPosterior);

            posteriorWeightSum += posteriorWeight;
            weightedThetaSum += posteriorWeight * theta;
            weightedThetaSquaredSum += posteriorWeight * theta * theta;
        }

        if (posteriorWeightSum == 0.0d || Double.isNaN(posteriorWeightSum)) {
            return new EapEstimate(0.0d, 1.0d, 1.0d);
        }

        double theta = weightedThetaSum / posteriorWeightSum;
        double posteriorSecondMoment = weightedThetaSquaredSum / posteriorWeightSum;
        double posteriorVariance = Math.max(1.0e-9, posteriorSecondMoment - (theta * theta));
        double standardError = Math.sqrt(posteriorVariance);

        return new EapEstimate(theta, standardError, posteriorVariance);
    }

    private double logNormalPrior(double theta) {
        return -0.5d * theta * theta - Math.log(SQRT_TWO_PI);
    }
}
