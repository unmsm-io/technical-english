package pe.edu.unmsm.fisi.techeng.review.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardState;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;

class FsrsSchedulerTest {

    private static final Instant REVIEW_TIME = Instant.parse("2026-04-07T12:00:00Z");

    private final FsrsScheduler scheduler = new FsrsScheduler();

    @ParameterizedTest(name = "{0}")
    @MethodSource("goldenCases")
    void schedule_shouldMatchGoldenVectors(
            String name,
            ReviewCardState current,
            ReviewGrade grade,
            RetentionTier tier,
            double expectedStability,
            double expectedDifficulty,
            CardState expectedState,
            int expectedScheduledDays,
            int expectedReps,
            int expectedLapses,
            long expectedDueDeltaSeconds
    ) {
        ReviewCardState actual = scheduler.schedule(current, grade, tier);

        assertThat(actual.stability()).as(name + " stability").isEqualTo(expectedStability);
        assertThat(actual.difficulty()).as(name + " difficulty").isEqualTo(expectedDifficulty);
        assertThat(actual.state()).as(name + " state").isEqualTo(expectedState);
        assertThat(actual.scheduledDays()).as(name + " scheduledDays").isEqualTo(expectedScheduledDays);
        assertThat(actual.reps()).as(name + " reps").isEqualTo(expectedReps);
        assertThat(actual.lapses()).as(name + " lapses").isEqualTo(expectedLapses);
        assertThat(actual.lastReview()).as(name + " lastReview").isEqualTo(REVIEW_TIME);
        assertThat(ChronoUnit.SECONDS.between(REVIEW_TIME, actual.due()))
                .as(name + " due delta")
                .isEqualTo(expectedDueDeltaSeconds);
    }

    private static List<org.junit.jupiter.params.provider.Arguments> goldenCases() {
        Instant previousReview = REVIEW_TIME.minus(5, ChronoUnit.DAYS);
        Instant previousMonth = REVIEW_TIME.minus(30, ChronoUnit.DAYS);

        return List.of(
                arguments("new_again_general", state(0.0, 0.0, 0, 0, 0, 0, CardState.NEW, previousReview), ReviewGrade.AGAIN, RetentionTier.GENERAL, 0.212, 6.4133, CardState.LEARNING, 0, 1, 0, 60),
                arguments("new_hard_general", state(0.0, 0.0, 0, 0, 0, 0, CardState.NEW, previousReview), ReviewGrade.HARD, RetentionTier.GENERAL, 1.2931, 5.11217071, CardState.LEARNING, 0, 1, 0, 360),
                arguments("new_good_general", state(0.0, 0.0, 0, 0, 0, 0, CardState.NEW, previousReview), ReviewGrade.GOOD, RetentionTier.GENERAL, 2.3065, 2.11810397, CardState.LEARNING, 0, 1, 0, 600),
                arguments("new_easy_general", state(0.0, 0.0, 0, 0, 0, 0, CardState.NEW, previousReview), ReviewGrade.EASY, RetentionTier.GENERAL, 8.2956, 1.0, CardState.REVIEW, 8, 1, 0, 691200),
                arguments("new_easy_technical", state(0.0, 0.0, 0, 0, 0, 0, CardState.NEW, previousReview), ReviewGrade.EASY, RetentionTier.TECHNICAL_CORE, 8.2956, 1.0, CardState.REVIEW, 4, 1, 0, 345600),
                arguments("learning_first_good", state(2.3065, 3.22424079, 0, 0, 1, 0, CardState.LEARNING, previousReview), ReviewGrade.GOOD, RetentionTier.GENERAL, 2.3065, 3.21624492, CardState.LEARNING, 0, 2, 0, 600),
                arguments("learning_first_hard", state(2.3065, 3.22424079, 0, 0, 1, 0, CardState.LEARNING, previousReview), ReviewGrade.HARD, RetentionTier.GENERAL, 2.3065, 5.48716366, CardState.LEARNING, 0, 2, 0, 360),
                arguments("learning_second_good", state(2.8027635, 3.22492377, 0, 0, 2, 0, CardState.LEARNING, previousReview), ReviewGrade.GOOD, RetentionTier.GENERAL, 2.8027635, 3.21692722, CardState.REVIEW, 3, 3, 0, 259200),
                arguments("learning_second_easy", state(2.8027635, 3.22492377, 0, 0, 2, 0, CardState.LEARNING, previousReview), ReviewGrade.EASY, RetentionTier.GENERAL, 4.73398824, 1.0, CardState.REVIEW, 5, 3, 0, 432000),
                arguments("learning_again", state(2.3065, 3.22424079, 0, 0, 1, 0, CardState.LEARNING, previousReview), ReviewGrade.AGAIN, RetentionTier.GENERAL, 0.77508398, 7.75808239, CardState.LEARNING, 0, 2, 0, 60),
                arguments("review_again_general", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.AGAIN, RetentionTier.GENERAL, 0.99022804, 8.24315441, CardState.RELEARNING, 0, 8, 2, 600),
                arguments("review_hard_general", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.HARD, RetentionTier.GENERAL, 13.17016767, 6.46684139, CardState.REVIEW, 13, 8, 1, 1123200),
                arguments("review_good_general", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.GOOD, RetentionTier.GENERAL, 18.32013248, 4.69052837, CardState.REVIEW, 18, 8, 1, 1555200),
                arguments("review_easy_general", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.EASY, RetentionTier.GENERAL, 29.59811612, 2.91421535, CardState.REVIEW, 30, 8, 1, 2592000),
                arguments("review_good_technical", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.GOOD, RetentionTier.TECHNICAL_CORE, 18.32013248, 4.69052837, CardState.REVIEW, 8, 8, 1, 691200),
                arguments("review_easy_technical", state(5.4, 4.7, 5, 5, 7, 1, CardState.REVIEW, previousReview), ReviewGrade.EASY, RetentionTier.TECHNICAL_CORE, 29.59811612, 2.91421535, CardState.REVIEW, 14, 8, 1, 1209600),
                arguments("review_long_gap_good", state(20.0, 6.0, 30, 18, 15, 2, CardState.REVIEW, previousMonth), ReviewGrade.GOOD, RetentionTier.GENERAL, 66.51135342, 5.98922837, CardState.REVIEW, 67, 16, 2, 5788800),
                arguments("review_long_gap_again", state(20.0, 6.0, 30, 18, 15, 2, CardState.REVIEW, previousMonth), ReviewGrade.AGAIN, RetentionTier.GENERAL, 2.05268549, 8.67045557, CardState.RELEARNING, 0, 16, 3, 600),
                arguments("relearning_good", state(2.2, 5.3, 0, 0, 8, 2, CardState.RELEARNING, previousReview), ReviewGrade.GOOD, RetentionTier.GENERAL, 2.2, 5.28992837, CardState.REVIEW, 2, 9, 2, 172800),
                arguments("relearning_hard", state(2.2, 5.3, 0, 0, 8, 2, CardState.RELEARNING, previousReview), ReviewGrade.HARD, RetentionTier.GENERAL, 2.2, 6.86514935, CardState.RELEARNING, 0, 9, 2, 900),
                arguments("relearning_again", state(2.2, 5.3, 0, 0, 8, 2, CardState.RELEARNING, previousReview), ReviewGrade.AGAIN, RetentionTier.GENERAL, 0.74159861, 8.44037033, CardState.RELEARNING, 0, 9, 2, 600),
                arguments("review_tier_difference_general", state(11.3, 4.2, 12, 9, 11, 1, CardState.REVIEW, REVIEW_TIME.minus(12, ChronoUnit.DAYS)), ReviewGrade.GOOD, RetentionTier.GENERAL, 40.45317502, 4.19102837, CardState.REVIEW, 40, 12, 1, 3456000),
                arguments("review_tier_difference_technical", state(11.3, 4.2, 12, 9, 11, 1, CardState.REVIEW, REVIEW_TIME.minus(12, ChronoUnit.DAYS)), ReviewGrade.GOOD, RetentionTier.TECHNICAL_CORE, 40.45317502, 4.19102837, CardState.REVIEW, 19, 12, 1, 1641600)
        );
    }

    private static org.junit.jupiter.params.provider.Arguments arguments(Object... values) {
        return org.junit.jupiter.params.provider.Arguments.of(values);
    }

    private static ReviewCardState state(
            double stability,
            double difficulty,
            int elapsedDays,
            int scheduledDays,
            int reps,
            int lapses,
            CardState state,
            Instant lastReview
    ) {
        return new ReviewCardState(
                stability,
                difficulty,
                elapsedDays,
                scheduledDays,
                reps,
                lapses,
                state,
                lastReview,
                REVIEW_TIME
        );
    }
}
