package pe.edu.unmsm.fisi.techeng.calibration.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

class RaschScorerTest {

    private final RaschScorer scorer = new RaschScorer();

    @ParameterizedTest
    @MethodSource("probabilityCases")
    void probability_shouldMatchGoldenVectors(double theta, double difficulty, double expectedProbability) {
        assertThat(scorer.probability(theta, difficulty))
                .isCloseTo(expectedProbability, org.assertj.core.data.Offset.offset(0.0005d));
    }

    @ParameterizedTest
    @MethodSource("informationCases")
    void information_shouldMatchGoldenVectors(
            double theta,
            double difficulty,
            double discrimination,
            double expectedInformation
    ) {
        assertThat(scorer.information(theta, difficulty, discrimination))
                .isCloseTo(expectedInformation, org.assertj.core.data.Offset.offset(0.0005d));
    }

    @org.junit.jupiter.api.Test
    void logLikelihood_shouldRewardBetterThetaCandidate() {
        List<Response> responses = List.of(
                new Response(1L, true),
                new Response(2L, true),
                new Response(3L, false)
        );
        Map<Long, ItemParams> items = Map.of(
                1L, new ItemParams(-0.8d, 1.0d),
                2L, new ItemParams(0.0d, 1.0d),
                3L, new ItemParams(1.1d, 1.0d)
        );

        double alignedTheta = scorer.logLikelihood(responses, 0.7d, items);
        double misalignedTheta = scorer.logLikelihood(responses, -1.5d, items);

        assertThat(alignedTheta).isGreaterThan(misalignedTheta);
    }

    private static List<org.junit.jupiter.params.provider.Arguments> probabilityCases() {
        return List.of(
                org.junit.jupiter.params.provider.Arguments.of(0.0d, 0.0d, 0.5d),
                org.junit.jupiter.params.provider.Arguments.of(2.0d, 0.0d, 0.8808d),
                org.junit.jupiter.params.provider.Arguments.of(-2.0d, 0.0d, 0.1192d),
                org.junit.jupiter.params.provider.Arguments.of(0.5d, -1.0d, 0.8176d),
                org.junit.jupiter.params.provider.Arguments.of(-0.5d, 1.0d, 0.1824d)
        );
    }

    private static List<org.junit.jupiter.params.provider.Arguments> informationCases() {
        return List.of(
                org.junit.jupiter.params.provider.Arguments.of(0.0d, 0.0d, 1.0d, 0.25d),
                org.junit.jupiter.params.provider.Arguments.of(1.0d, 0.0d, 1.0d, 0.1966d),
                org.junit.jupiter.params.provider.Arguments.of(0.0d, 0.0d, 1.2d, 0.36d)
        );
    }
}
