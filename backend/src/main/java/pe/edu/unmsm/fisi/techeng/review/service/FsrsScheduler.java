package pe.edu.unmsm.fisi.techeng.review.service;

import java.time.Instant;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardState;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;

/**
 * Hand-port of ts-fsrs FSRS-6 reference implementation. Algorithm computes
 * retrievability via three-component memory model (stability, difficulty,
 * retrievability), updates state via gradient-derived weights, schedules next
 * review to hit target retention probability. Based on Ye et al. (2022, 2023).
 */
@org.springframework.stereotype.Component
public class FsrsScheduler {

    static final double[] DEFAULT_W = {
            0.2120, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194,
            0.0010, 1.8722, 0.1666, 0.7960, 1.4835, 0.0614, 0.2629,
            1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542
    };

    static final double DECAY = -0.5;
    static final double FACTOR = 19.0 / 81.0;
    static final double S_MIN = 0.001;
    static final int MAX_INTERVAL = 36500;
    private static final int ONE_MINUTE = 60;
    private static final int SIX_MINUTES = 6 * ONE_MINUTE;
    private static final int TEN_MINUTES = 10 * ONE_MINUTE;
    private static final int FIFTEEN_MINUTES = 15 * ONE_MINUTE;

    public ReviewCardState schedule(ReviewCardState current, ReviewGrade grade, RetentionTier tier) {
        if (current == null) {
            throw new IllegalArgumentException("Current review card state is required");
        }
        if (grade == null) {
            throw new IllegalArgumentException("Review grade is required");
        }
        if (tier == null) {
            throw new IllegalArgumentException("Retention tier is required");
        }

        Instant reviewTime = current.due() != null
                ? current.due()
                : current.lastReview() != null ? current.lastReview() : Instant.EPOCH;

        ReviewCardState nextMemory = nextMemoryState(current, grade);
        int nextReps = current.reps() + 1;
        int nextLapses = current.lapses() + shouldCountLapse(current.state(), grade);

        return switch (current.state()) {
            case NEW -> scheduleFromNew(current, nextMemory, grade, tier, reviewTime, nextReps, nextLapses);
            case LEARNING -> scheduleFromLearning(current, nextMemory, grade, tier, reviewTime, nextReps, nextLapses);
            case REVIEW -> scheduleFromReview(current, nextMemory, grade, tier, reviewTime, nextReps, nextLapses);
            case RELEARNING -> scheduleFromRelearning(current, nextMemory, grade, tier, reviewTime, nextReps, nextLapses);
        };
    }

    private ReviewCardState scheduleFromNew(
            ReviewCardState current,
            ReviewCardState nextMemory,
            ReviewGrade grade,
            RetentionTier tier,
            Instant reviewTime,
            int reps,
            int lapses
    ) {
        if (grade == ReviewGrade.EASY) {
            int intervalDays = nextInterval(nextMemory.stability(), tier.getRequestRetention());
            return completedState(nextMemory, CardState.REVIEW, reviewTime, intervalDays, reps, lapses);
        }
        int waitSeconds = grade == ReviewGrade.AGAIN ? ONE_MINUTE : grade == ReviewGrade.HARD ? SIX_MINUTES : TEN_MINUTES;
        return learningState(nextMemory, CardState.LEARNING, reviewTime, waitSeconds, reps, lapses);
    }

    private ReviewCardState scheduleFromLearning(
            ReviewCardState current,
            ReviewCardState nextMemory,
            ReviewGrade grade,
            RetentionTier tier,
            Instant reviewTime,
            int reps,
            int lapses
    ) {
        if (grade == ReviewGrade.AGAIN) {
            return learningState(nextMemory, CardState.LEARNING, reviewTime, ONE_MINUTE, reps, lapses);
        }
        if (grade == ReviewGrade.HARD) {
            return learningState(nextMemory, CardState.LEARNING, reviewTime, SIX_MINUTES, reps, lapses);
        }
        if (current.reps() <= 1) {
            return learningState(nextMemory, CardState.LEARNING, reviewTime, TEN_MINUTES, reps, lapses);
        }
        int intervalDays = nextInterval(nextMemory.stability(), tier.getRequestRetention());
        return completedState(nextMemory, CardState.REVIEW, reviewTime, intervalDays, reps, lapses);
    }

    private ReviewCardState scheduleFromReview(
            ReviewCardState current,
            ReviewCardState nextMemory,
            ReviewGrade grade,
            RetentionTier tier,
            Instant reviewTime,
            int reps,
            int lapses
    ) {
        if (grade == ReviewGrade.AGAIN) {
            return learningState(nextMemory, CardState.RELEARNING, reviewTime, TEN_MINUTES, reps, lapses);
        }

        int intervalDays = nextInterval(nextMemory.stability(), tier.getRequestRetention());
        if (grade == ReviewGrade.HARD) {
            intervalDays = Math.max(1, intervalDays);
        } else if (grade == ReviewGrade.GOOD) {
            intervalDays = Math.max(intervalDays, current.scheduledDays() + 1);
        } else {
            intervalDays = Math.max(intervalDays, current.scheduledDays() + 2);
        }
        return completedState(nextMemory, CardState.REVIEW, reviewTime, intervalDays, reps, lapses);
    }

    private ReviewCardState scheduleFromRelearning(
            ReviewCardState current,
            ReviewCardState nextMemory,
            ReviewGrade grade,
            RetentionTier tier,
            Instant reviewTime,
            int reps,
            int lapses
    ) {
        if (grade == ReviewGrade.AGAIN) {
            return learningState(nextMemory, CardState.RELEARNING, reviewTime, TEN_MINUTES, reps, lapses);
        }
        if (grade == ReviewGrade.HARD) {
            return learningState(nextMemory, CardState.RELEARNING, reviewTime, FIFTEEN_MINUTES, reps, lapses);
        }
        int intervalDays = nextInterval(nextMemory.stability(), tier.getRequestRetention());
        return completedState(nextMemory, CardState.REVIEW, reviewTime, intervalDays, reps, lapses);
    }

    private ReviewCardState learningState(
            ReviewCardState nextMemory,
            CardState state,
            Instant reviewTime,
            int waitSeconds,
            int reps,
            int lapses
    ) {
        return new ReviewCardState(
                nextMemory.stability(),
                nextMemory.difficulty(),
                0,
                0,
                reps,
                lapses,
                state,
                reviewTime,
                reviewTime.plusSeconds(waitSeconds)
        );
    }

    private ReviewCardState completedState(
            ReviewCardState nextMemory,
            CardState state,
            Instant reviewTime,
            int intervalDays,
            int reps,
            int lapses
    ) {
        return new ReviewCardState(
                nextMemory.stability(),
                nextMemory.difficulty(),
                0,
                intervalDays,
                reps,
                lapses,
                state,
                reviewTime,
                reviewTime.plusSeconds((long) intervalDays * 24L * 60L * 60L)
        );
    }

    private ReviewCardState nextMemoryState(ReviewCardState current, ReviewGrade grade) {
        double difficulty = current.difficulty();
        double stability = current.stability();

        if (difficulty == 0.0 && stability == 0.0) {
            return new ReviewCardState(
                    initStability(grade),
                    clamp(initDifficulty(grade), 1.0, 10.0),
                    current.elapsedDays(),
                    current.scheduledDays(),
                    current.reps(),
                    current.lapses(),
                    current.state(),
                    current.lastReview(),
                    current.due()
            );
        }

        double retrievability = forgettingCurve(current.elapsedDays(), stability);
        double nextStability;
        if (current.elapsedDays() == 0) {
            nextStability = nextShortTermStability(stability, grade);
        } else if (grade == ReviewGrade.AGAIN) {
            nextStability = clamp(nextForgetStability(difficulty, stability, retrievability), S_MIN, stability);
        } else {
            nextStability = nextRecallStability(difficulty, stability, retrievability, grade);
        }

        return new ReviewCardState(
                nextStability,
                nextDifficulty(difficulty, grade),
                current.elapsedDays(),
                current.scheduledDays(),
                current.reps(),
                current.lapses(),
                current.state(),
                current.lastReview(),
                current.due()
        );
    }

    double initStability(ReviewGrade grade) {
        return Math.max(DEFAULT_W[grade.getValue() - 1], 0.1);
    }

    double initDifficulty(ReviewGrade grade) {
        double difficulty = DEFAULT_W[4] - Math.exp((grade.getValue() - 1) * DEFAULT_W[5]) + 1;
        return roundTo(difficulty);
    }

    double nextDifficulty(double difficulty, ReviewGrade grade) {
        double deltaDifficulty = -DEFAULT_W[6] * (grade.getValue() - 3);
        double nextDifficulty = difficulty + linearDamping(deltaDifficulty, difficulty);
        double revertedDifficulty = meanReversion(initDifficulty(ReviewGrade.EASY), nextDifficulty);
        return roundTo(clamp(revertedDifficulty, 1.0, 10.0));
    }

    double nextRecallStability(double difficulty, double stability, double retrievability, ReviewGrade grade) {
        double hardPenalty = grade == ReviewGrade.HARD ? DEFAULT_W[15] : 1.0;
        double easyBonus = grade == ReviewGrade.EASY ? DEFAULT_W[16] : 1.0;
        double nextStability = stability * (
                1.0
                        + Math.exp(DEFAULT_W[8])
                        * (11.0 - difficulty)
                        * Math.pow(stability, -DEFAULT_W[9])
                        * (Math.exp((1.0 - retrievability) * DEFAULT_W[10]) - 1.0)
                        * hardPenalty
                        * easyBonus
        );
        return roundTo(clamp(nextStability, S_MIN, MAX_INTERVAL));
    }

    double nextForgetStability(double difficulty, double stability, double retrievability) {
        double nextStability = DEFAULT_W[11]
                * Math.pow(difficulty, -DEFAULT_W[12])
                * (Math.pow(stability + 1.0, DEFAULT_W[13]) - 1.0)
                * Math.exp((1.0 - retrievability) * DEFAULT_W[14]);
        return roundTo(clamp(nextStability, S_MIN, MAX_INTERVAL));
    }

    double nextShortTermStability(double stability, ReviewGrade grade) {
        double shortIncrease = Math.pow(stability, -DEFAULT_W[19])
                * Math.exp(DEFAULT_W[17] * (grade.getValue() - 3 + DEFAULT_W[18]));
        double maskedShortIncrease = grade.getValue() >= ReviewGrade.HARD.getValue()
                ? Math.max(shortIncrease, 1.0)
                : shortIncrease;
        return roundTo(clamp(stability * maskedShortIncrease, S_MIN, MAX_INTERVAL));
    }

    double forgettingCurve(int elapsedDays, double stability) {
        if (stability <= 0.0) {
            return 0.0;
        }
        return roundTo(Math.pow(1.0 + FACTOR * elapsedDays / stability, DECAY));
    }

    int nextInterval(double stability, double requestRetention) {
        double rawInterval = stability * (Math.pow(requestRetention, 1.0 / DECAY) - 1.0) / FACTOR;
        return (int) clamp(Math.round(rawInterval), 1.0, MAX_INTERVAL);
    }

    private int shouldCountLapse(CardState state, ReviewGrade grade) {
        return state == CardState.REVIEW && grade == ReviewGrade.AGAIN ? 1 : 0;
    }

    private double linearDamping(double deltaDifficulty, double oldDifficulty) {
        return roundTo(deltaDifficulty * (10.0 - oldDifficulty) / 9.0);
    }

    private double meanReversion(double initialDifficulty, double currentDifficulty) {
        return roundTo(DEFAULT_W[7] * initialDifficulty + (1.0 - DEFAULT_W[7]) * currentDifficulty);
    }

    private double clamp(double value, double min, double max) {
        return Math.min(Math.max(value, min), max);
    }

    private double roundTo(double value) {
        return Math.round(value * 100_000_000d) / 100_000_000d;
    }
}
