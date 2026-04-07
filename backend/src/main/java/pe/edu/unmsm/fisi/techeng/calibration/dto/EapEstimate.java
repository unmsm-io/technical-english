package pe.edu.unmsm.fisi.techeng.calibration.dto;

public record EapEstimate(
        double theta,
        double standardError,
        double posteriorVariance
) {
}
