package pe.edu.unmsm.fisi.techeng.calibration.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

/**
 * Joint Maximum Likelihood (JML) iterative calibration. Alternates between
 * estimating user abilities and item difficulties until convergence.
 * Sharpnack et al. (2024) AutoIRT shows how this is automated end-to-end with
 * modern AutoML, but JML remains the simplest baseline.
 */
@Component
public class ItemCalibrator {

    private static final int MAX_ITERATIONS = 50;
    private static final double CONVERGENCE_THRESHOLD = 0.001d;
    private static final double MIN_DIFFICULTY = -4.0d;
    private static final double MAX_DIFFICULTY = 4.0d;

    private final AbilityEstimator abilityEstimator;
    private final RaschScorer raschScorer;

    public ItemCalibrator(AbilityEstimator abilityEstimator, RaschScorer raschScorer) {
        this.abilityEstimator = abilityEstimator;
        this.raschScorer = raschScorer;
    }

    public Map<Long, ItemParams> calibrateItems(Map<Long, List<Response>> responsesByUser) {
        if (responsesByUser == null || responsesByUser.isEmpty()) {
            return Map.of();
        }

        List<Long> itemIds = responsesByUser.values().stream()
                .flatMap(List::stream)
                .map(Response::itemId)
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();

        Map<Long, ItemParams> itemParams = new LinkedHashMap<>();
        for (Long itemId : itemIds) {
            itemParams.put(itemId, new ItemParams(0.0d, 1.0d));
        }

        for (int iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
            Map<Long, Double> abilities = estimateAbilities(responsesByUser, itemParams);
            double maxChange = 0.0d;

            for (Long itemId : itemIds) {
                double previousDifficulty = itemParams.get(itemId).difficulty();
                double updatedDifficulty = estimateDifficulty(itemId, responsesByUser, abilities, previousDifficulty);
                itemParams.put(itemId, new ItemParams(updatedDifficulty, 1.0d));
                maxChange = Math.max(maxChange, Math.abs(updatedDifficulty - previousDifficulty));
            }

            double meanDifficulty = itemParams.values().stream()
                    .mapToDouble(ItemParams::difficulty)
                    .average()
                    .orElse(0.0d);

            if (meanDifficulty != 0.0d) {
                for (Long itemId : itemIds) {
                    ItemParams params = itemParams.get(itemId);
                    itemParams.put(itemId, new ItemParams(params.difficulty() - meanDifficulty, params.discrimination()));
                }
            }

            if (maxChange < CONVERGENCE_THRESHOLD) {
                break;
            }
        }

        return itemParams;
    }

    private Map<Long, Double> estimateAbilities(Map<Long, List<Response>> responsesByUser, Map<Long, ItemParams> itemParams) {
        Map<Long, Double> abilities = new LinkedHashMap<>();
        for (Map.Entry<Long, List<Response>> entry : responsesByUser.entrySet()) {
            EapEstimate estimate = abilityEstimator.estimateTheta(entry.getValue(), itemParams);
            abilities.put(entry.getKey(), estimate.theta());
        }
        return abilities;
    }

    private double estimateDifficulty(
            Long itemId,
            Map<Long, List<Response>> responsesByUser,
            Map<Long, Double> abilities,
            double initialDifficulty
    ) {
        List<ResponseObservation> observations = collectObservations(itemId, responsesByUser, abilities);
        if (observations.isEmpty()) {
            return initialDifficulty;
        }

        double difficulty = initialDifficulty;
        for (int iteration = 0; iteration < 25; iteration++) {
            double gradient = 0.0d;
            double information = 0.0d;

            for (ResponseObservation observation : observations) {
                double probability = raschScorer.probability(
                        observation.theta(),
                        difficulty,
                        1.0d
                );
                double residual = (observation.correct() ? 1.0d : 0.0d) - probability;
                gradient += probability - (observation.correct() ? 1.0d : 0.0d);
                information += probability * (1.0d - probability);
                if (Math.abs(residual) < 1.0e-12) {
                    gradient += 0.0d;
                }
            }

            if (information < 1.0e-9) {
                break;
            }

            double updated = clamp(difficulty + (gradient / information), MIN_DIFFICULTY, MAX_DIFFICULTY);
            if (Math.abs(updated - difficulty) < CONVERGENCE_THRESHOLD) {
                difficulty = updated;
                break;
            }
            difficulty = updated;
        }

        return difficulty;
    }

    private List<ResponseObservation> collectObservations(
            Long itemId,
            Map<Long, List<Response>> responsesByUser,
            Map<Long, Double> abilities
    ) {
        List<ResponseObservation> observations = new ArrayList<>();
        for (Map.Entry<Long, List<Response>> entry : responsesByUser.entrySet()) {
            Double theta = abilities.get(entry.getKey());
            if (theta == null) {
                continue;
            }
            for (Response response : entry.getValue()) {
                if (itemId.equals(response.itemId())) {
                    observations.add(new ResponseObservation(theta, response.correct()));
                }
            }
        }
        return observations;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private record ResponseObservation(double theta, boolean correct) {
    }
}
