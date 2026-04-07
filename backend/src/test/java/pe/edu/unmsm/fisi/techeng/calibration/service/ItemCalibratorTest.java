package pe.edu.unmsm.fisi.techeng.calibration.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

class ItemCalibratorTest {

    private final RaschScorer raschScorer = new RaschScorer();
    private final AbilityEstimator abilityEstimator = new AbilityEstimator(raschScorer);
    private final ItemCalibrator calibrator = new ItemCalibrator(abilityEstimator, raschScorer);

    @Test
    void calibrateItems_shouldRecoverDifficultyOrderingFromSyntheticData() {
        Map<Long, ItemParams> trueParams = Map.of(
                101L, new ItemParams(-1.2d, 1.0d),
                102L, new ItemParams(-0.1d, 1.0d),
                103L, new ItemParams(1.1d, 1.0d)
        );

        Map<Long, List<Response>> responsesByUser = new LinkedHashMap<>();
        List<Double> abilityGrid = buildAbilityGrid();
        long userId = 1L;
        for (double theta : abilityGrid) {
            List<Response> responses = new ArrayList<>();
            for (Map.Entry<Long, ItemParams> entry : trueParams.entrySet()) {
                double probability = raschScorer.probability(theta, entry.getValue().difficulty());
                responses.add(new Response(entry.getKey(), probability >= 0.5d));
            }
            responsesByUser.put(userId++, responses);
        }

        Map<Long, ItemParams> estimated = calibrator.calibrateItems(responsesByUser);

        assertThat(estimated.get(101L).difficulty()).isLessThan(estimated.get(102L).difficulty());
        assertThat(estimated.get(102L).difficulty()).isLessThan(estimated.get(103L).difficulty());
        assertThat(estimated.values()).allSatisfy(params ->
                assertThat(params.discrimination()).isEqualTo(1.0d)
        );
        assertThat(estimated.get(101L).difficulty()).isCloseTo(-1.1d, org.assertj.core.data.Offset.offset(0.6d));
        assertThat(estimated.get(102L).difficulty()).isCloseTo(0.0d, org.assertj.core.data.Offset.offset(0.5d));
        assertThat(estimated.get(103L).difficulty()).isCloseTo(1.1d, org.assertj.core.data.Offset.offset(0.6d));
    }

    private List<Double> buildAbilityGrid() {
        List<Double> abilities = new ArrayList<>();
        for (int repetition = 0; repetition < 12; repetition++) {
            for (double theta = -3.0d; theta <= 3.0d; theta += 0.5d) {
                abilities.add(theta);
            }
        }
        return abilities;
    }
}
