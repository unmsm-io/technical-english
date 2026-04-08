package pe.edu.unmsm.fisi.techeng.pilot.service;

import org.springframework.stereotype.Component;

@Component
public class CohenDCalculator {

    public double cohenD(double[] preGroup, double[] postGroup) {
        if (preGroup.length == 0 || postGroup.length == 0) {
            return 0.0;
        }

        double preMean = mean(preGroup);
        double postMean = mean(postGroup);
        double preVariance = variance(preGroup, preMean);
        double postVariance = variance(postGroup, postMean);
        double pooledVariance =
                ((preGroup.length - 1) * preVariance + (postGroup.length - 1) * postVariance)
                        / Math.max(preGroup.length + postGroup.length - 2, 1);
        double pooledSd = Math.sqrt(Math.max(pooledVariance, 0.0));
        if (pooledSd == 0.0) {
            return 0.0;
        }
        return (postMean - preMean) / pooledSd;
    }

    private double mean(double[] values) {
        double total = 0.0;
        for (double value : values) {
            total += value;
        }
        return total / values.length;
    }

    private double variance(double[] values, double mean) {
        if (values.length < 2) {
            return 0.0;
        }
        double total = 0.0;
        for (double value : values) {
            total += Math.pow(value - mean, 2);
        }
        return total / (values.length - 1);
    }
}
