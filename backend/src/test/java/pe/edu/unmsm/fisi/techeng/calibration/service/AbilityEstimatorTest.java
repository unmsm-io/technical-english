package pe.edu.unmsm.fisi.techeng.calibration.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import pe.edu.unmsm.fisi.techeng.calibration.dto.EapEstimate;
import pe.edu.unmsm.fisi.techeng.calibration.dto.ItemParams;
import pe.edu.unmsm.fisi.techeng.calibration.dto.Response;

class AbilityEstimatorTest {

    private final AbilityEstimator estimator = new AbilityEstimator(new RaschScorer());

    @Test
    void estimateTheta_shouldReturnHighThetaForMostlyCorrectResponses() {
        Map<Long, ItemParams> items = buildItems();
        List<Response> responses = List.of(
                new Response(1L, true),
                new Response(2L, true),
                new Response(3L, true),
                new Response(4L, true),
                new Response(5L, false)
        );

        EapEstimate estimate = estimator.estimateTheta(responses, items);

        assertThat(estimate.theta()).isGreaterThan(0.6d);
        assertThat(estimate.standardError()).isLessThan(1.0d);
    }

    @Test
    void estimateTheta_shouldReturnLowThetaForMostlyIncorrectResponses() {
        Map<Long, ItemParams> items = buildItems();
        List<Response> responses = List.of(
                new Response(1L, false),
                new Response(2L, false),
                new Response(3L, false),
                new Response(4L, false),
                new Response(5L, true)
        );

        EapEstimate estimate = estimator.estimateTheta(responses, items);

        assertThat(estimate.theta()).isLessThan(-0.6d);
        assertThat(estimate.standardError()).isLessThan(1.0d);
    }

    @Test
    void estimateTheta_shouldReturnNearZeroForBalancedResponses() {
        Map<Long, ItemParams> items = buildItems();
        List<Response> responses = List.of(
                new Response(1L, true),
                new Response(2L, true),
                new Response(3L, false),
                new Response(4L, false),
                new Response(5L, true),
                new Response(6L, false)
        );

        EapEstimate estimate = estimator.estimateTheta(responses, items);

        assertThat(estimate.theta()).isBetween(-0.5d, 0.5d);
    }

    @Test
    void estimateTheta_shouldReduceStandardErrorWithMoreResponses() {
        Map<Long, ItemParams> items = buildItems();

        EapEstimate sparse = estimator.estimateTheta(
                List.of(
                        new Response(1L, true),
                        new Response(2L, false)
                ),
                items
        );

        List<Response> denseResponses = new ArrayList<>();
        for (int itemId = 1; itemId <= 6; itemId++) {
            denseResponses.add(new Response((long) itemId, itemId <= 3));
        }
        for (int itemId = 1; itemId <= 6; itemId++) {
            denseResponses.add(new Response((long) itemId, itemId <= 4));
        }
        EapEstimate dense = estimator.estimateTheta(denseResponses, items);

        assertThat(dense.standardError()).isLessThan(sparse.standardError());
    }

    private Map<Long, ItemParams> buildItems() {
        Map<Long, ItemParams> items = new LinkedHashMap<>();
        items.put(1L, new ItemParams(-1.5d, 1.0d));
        items.put(2L, new ItemParams(-0.8d, 1.0d));
        items.put(3L, new ItemParams(-0.2d, 1.0d));
        items.put(4L, new ItemParams(0.4d, 1.0d));
        items.put(5L, new ItemParams(1.0d, 1.0d));
        items.put(6L, new ItemParams(1.6d, 1.0d));
        return items;
    }
}
