package pe.edu.unmsm.fisi.techeng.kc.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BktUpdaterTest {

    private static final double DELTA = 1.0e-6;

    private final BktUpdater bktUpdater = new BktUpdater();

    @Test
    void updateShouldMatchGoldenVectorForCorrectResponse() {
        double updated = bktUpdater.update(0.5, true, 0.3, 0.2, 0.1);

        assertThat(updated).isCloseTo(0.8727272727, withinDelta());
    }

    @Test
    void updateShouldMatchGoldenVectorForIncorrectResponse() {
        double updated = bktUpdater.update(0.5, false, 0.3, 0.2, 0.1);

        assertThat(updated).isCloseTo(0.3777777778, withinDelta());
    }

    @Test
    void repeatedCorrectResponsesShouldConvergeTowardMastery() {
        double pLearned = 0.1;
        for (int index = 0; index < 5; index++) {
            pLearned = bktUpdater.update(pLearned, true, 0.3, 0.2, 0.1);
        }

        assertThat(pLearned).isGreaterThan(0.99);
    }

    @Test
    void edgeCasesShouldStayWithinProbabilityBounds() {
        assertThat(bktUpdater.update(0.0, true, 0.3, 0.2, 0.1)).isBetween(0.0, 1.0);
        assertThat(bktUpdater.update(1.0, false, 0.3, 0.2, 0.1)).isBetween(0.0, 1.0);
        assertThat(bktUpdater.update(0.5, true, 0.0, 0.0, 0.0)).isEqualTo(1.0);
        assertThat(bktUpdater.probabilityCorrect(0.0, 0.2, 0.1)).isCloseTo(0.2, withinDelta());
        assertThat(bktUpdater.probabilityCorrect(1.0, 0.2, 0.1)).isCloseTo(0.9, withinDelta());
    }

    private org.assertj.core.data.Offset<Double> withinDelta() {
        return org.assertj.core.data.Offset.offset(DELTA);
    }
}
