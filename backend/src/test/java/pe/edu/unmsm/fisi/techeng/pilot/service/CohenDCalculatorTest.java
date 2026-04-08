package pe.edu.unmsm.fisi.techeng.pilot.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CohenDCalculatorTest {

    @Test
    void shouldMatchGoldenVector() {
        CohenDCalculator calculator = new CohenDCalculator();
        double value = calculator.cohenD(
                new double[] {1, 2, 3, 4, 5},
                new double[] {3, 4, 5, 6, 7}
        );
        assertThat(value).isCloseTo(1.2649, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    void shouldReturnZeroWhenVarianceIsZero() {
        CohenDCalculator calculator = new CohenDCalculator();
        assertThat(calculator.cohenD(new double[] {1, 1, 1}, new double[] {1, 1, 1})).isZero();
    }
}
