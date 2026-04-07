package pe.edu.unmsm.fisi.techeng.review.entity;

/**
 * Two retention policies based on Nation (2013) vocabulary tiers: TECHNICAL_CORE
 * (EEWL/CSAWL terms, target retention 0.95 for shorter intervals) vs GENERAL
 * (GSL/AWL terms, target retention 0.90 for longer intervals). Cepeda et al. (2008)
 * showed optimal spacing varies with required retention horizon.
 */
public enum RetentionTier {
    TECHNICAL_CORE(0.95),
    GENERAL(0.90);

    private final double requestRetention;

    RetentionTier(double requestRetention) {
        this.requestRetention = requestRetention;
    }

    public double getRequestRetention() {
        return requestRetention;
    }
}
