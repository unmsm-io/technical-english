package pe.edu.unmsm.fisi.techeng.kc.service;

import org.springframework.stereotype.Component;

/**
 * Bayesian Knowledge Tracing (Corbett & Anderson 1995). Estimates P(L) per
 * knowledge component using a 4-parameter HMM: P(L0) initial knowledge, P(T)
 * transition (learning per opportunity), P(G) guess (correct without knowing),
 * P(S) slip (incorrect when knowing). Update is 2-step: posterior via Bayes
 * given observation, then forward transition.
 */
@Component
public class BktUpdater {

    public double update(
            double pLearned,
            boolean correct,
            double pTransition,
            double pGuess,
            double pSlip
    ) {
        double normalizedPLearned = clampProbability(pLearned);
        double normalizedPTransition = clampProbability(pTransition);
        double normalizedPGuess = clampProbability(pGuess);
        double normalizedPSlip = clampProbability(pSlip);

        double pCorrect = probabilityCorrect(normalizedPLearned, normalizedPGuess, normalizedPSlip);
        double posterior;
        if (correct) {
            if (pCorrect == 0.0) {
                posterior = 0.0;
            } else {
                posterior = (normalizedPLearned * (1.0 - normalizedPSlip)) / pCorrect;
            }
        } else {
            double pIncorrect = 1.0 - pCorrect;
            if (pIncorrect == 0.0) {
                posterior = 1.0;
            } else {
                posterior = (normalizedPLearned * normalizedPSlip) / pIncorrect;
            }
        }

        double updated = posterior + (1.0 - posterior) * normalizedPTransition;
        return clampProbability(updated);
    }

    public double probabilityCorrect(double pLearned, double pGuess, double pSlip) {
        double normalizedPLearned = clampProbability(pLearned);
        double normalizedPGuess = clampProbability(pGuess);
        double normalizedPSlip = clampProbability(pSlip);
        return clampProbability(
                normalizedPLearned * (1.0 - normalizedPSlip)
                        + (1.0 - normalizedPLearned) * normalizedPGuess
        );
    }

    private double clampProbability(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }
}
