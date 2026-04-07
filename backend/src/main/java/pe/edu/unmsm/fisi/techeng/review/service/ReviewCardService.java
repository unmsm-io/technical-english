package pe.edu.unmsm.fisi.techeng.review.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewBootstrapResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardResponse;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewCardState;
import pe.edu.unmsm.fisi.techeng.review.dto.ReviewStatsResponse;
import pe.edu.unmsm.fisi.techeng.review.entity.CardState;
import pe.edu.unmsm.fisi.techeng.review.entity.RetentionTier;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewCard;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;
import pe.edu.unmsm.fisi.techeng.review.mapper.ReviewMapper;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewCardRepository;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.mapper.VocabularyMapper;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewCardService {

    private final ReviewCardRepository reviewCardRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final VocabularyRepository vocabularyRepository;
    private final VocabularyMapper vocabularyMapper;
    private final ReviewMapper reviewMapper;
    private final FsrsScheduler fsrsScheduler;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ReviewCardResponse> getDueCards(Long userId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<ReviewCard> dueCards = reviewCardRepository.findTop50ByUserIdAndDueLessThanEqualOrderByDueAsc(userId, Instant.now())
                .stream()
                .limit(safeLimit)
                .toList();
        return mapCards(dueCards);
    }

    public ReviewCardResponse gradeCard(Long cardId, ReviewGrade grade) {
        ReviewCard card = reviewCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Review card not found with id: " + cardId));

        Instant reviewTime = Instant.now();
        int elapsedDays = computeElapsedDays(card.getLastReview(), reviewTime);
        ReviewCardState current = reviewMapper.toState(card, reviewTime, elapsedDays);
        ReviewCardState next = fsrsScheduler.schedule(current, grade, card.getRetentionTier());

        ReviewLog reviewLog = new ReviewLog();
        reviewLog.setCardId(card.getId());
        reviewLog.setUserId(card.getUserId());
        reviewLog.setGrade(grade);
        reviewLog.setPreviousStability(card.getStability());
        reviewLog.setNewStability(next.stability());
        reviewLog.setPreviousDifficulty(card.getDifficulty());
        reviewLog.setNewDifficulty(next.difficulty());
        reviewLog.setElapsedDaysAtReview(elapsedDays);
        reviewLog.setIntervalDaysScheduled(next.scheduledDays());
        reviewLog.setReviewedAt(reviewTime);
        reviewLogRepository.save(reviewLog);

        applyState(card, next, elapsedDays);
        ReviewCard savedCard = reviewCardRepository.save(card);
        return toResponse(savedCard);
    }

    public ReviewBootstrapResponse bootstrapForUser(Long userId, CefrLevel placedLevel) {
        long startedAt = System.currentTimeMillis();

        if (reviewCardRepository.existsByUserId(userId)) {
            return new ReviewBootstrapResponse(0, placedLevel, System.currentTimeMillis() - startedAt);
        }

        List<VocabularyItem> vocabularyItems = vocabularyRepository.findAll().stream()
                .filter(item -> item.getCefrLevel().ordinal() <= placedLevel.ordinal())
                .toList();

        List<ReviewCard> cards = vocabularyItems.stream()
                .map(item -> buildReviewCard(userId, item))
                .toList();

        reviewCardRepository.saveAll(cards);
        log.info("Bootstrapped {} review cards for user {} at level {}", cards.size(), userId, placedLevel);
        return new ReviewBootstrapResponse(cards.size(), placedLevel, System.currentTimeMillis() - startedAt);
    }

    public ReviewBootstrapResponse bootstrapForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (user.getEnglishLevel() == null || user.getEnglishLevel().isBlank()) {
            throw new BusinessRuleException("El usuario todavia no tiene un nivel CEFR asignado");
        }
        return bootstrapForUser(userId, CefrLevel.valueOf(user.getEnglishLevel()));
    }

    @Transactional(readOnly = true)
    public ReviewStatsResponse getStats(Long userId) {
        Instant now = Instant.now();
        Instant tomorrow = LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant nextWeek = LocalDate.now(ZoneOffset.UTC).plusDays(7).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant lastThirtyDays = now.minus(30, ChronoUnit.DAYS);

        Map<String, Long> byState = new LinkedHashMap<>();
        for (CardState state : CardState.values()) {
            byState.put(state.name(), reviewCardRepository.countByUserIdAndState(userId, state));
        }

        Map<String, Long> byTier = new LinkedHashMap<>();
        for (RetentionTier tier : RetentionTier.values()) {
            byTier.put(tier.name(), reviewCardRepository.countByUserIdAndRetentionTier(userId, tier));
        }

        List<ReviewCard> topFailedCards = reviewCardRepository.findTop10ByUserIdOrderByLapsesDescDueAsc(userId);
        Map<Long, VocabularyResponse> vocabularyById = loadVocabularyMap(
                topFailedCards.stream().map(ReviewCard::getVocabularyItemId).collect(Collectors.toSet())
        );

        long reviewedLastThirtyDays = reviewLogRepository.countByUserIdAndReviewedAtGreaterThanEqual(userId, lastThirtyDays);
        long successfulReviews = reviewLogRepository.countByUserIdAndGradeNotAndReviewedAtGreaterThanEqual(userId, ReviewGrade.AGAIN, lastThirtyDays);
        double retentionRate = reviewedLastThirtyDays == 0 ? 0.0 : round(successfulReviews * 100.0 / reviewedLastThirtyDays);

        List<ReviewCard> allCards = reviewCardRepository.findAll().stream()
                .filter(card -> Objects.equals(card.getUserId(), userId))
                .toList();
        double avgStability = allCards.isEmpty()
                ? 0.0
                : round(allCards.stream().mapToDouble(ReviewCard::getStability).average().orElse(0.0));

        return new ReviewStatsResponse(
                reviewCardRepository.countByUserId(userId),
                reviewCardRepository.countByUserIdAndDueLessThanEqual(userId, now),
                reviewCardRepository.countByUserIdAndDueLessThanEqual(userId, tomorrow),
                reviewCardRepository.countByUserIdAndDueLessThanEqual(userId, nextWeek),
                byState,
                byTier,
                retentionRate,
                avgStability,
                computeLongestStreak(reviewLogRepository.findTop120ByUserIdOrderByReviewedAtDesc(userId)),
                computeWeeklyRetention(reviewLogRepository.findReviewedSince(userId, now.minus(56, ChronoUnit.DAYS))),
                topFailedCards.stream()
                        .map(card -> new ReviewStatsResponse.TopFailedCard(
                                card.getId(),
                                vocabularyById.get(card.getVocabularyItemId()).term(),
                                card.getLapses(),
                                vocabularyById.get(card.getVocabularyItemId()).layer().name()
                        ))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public Page<ReviewCardResponse> getDeck(
            Long userId,
            CardState state,
            RetentionTier tier,
            VocabularyLayer layer,
            String query,
            Pageable pageable
    ) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        return reviewCardRepository.searchDeck(userId, state, tier, layer, normalizedQuery, pageable)
                .map(this::toResponse);
    }

    public void resetCard(Long cardId) {
        ReviewCard card = reviewCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Review card not found with id: " + cardId));
        card.setStability(0.0);
        card.setDifficulty(0.0);
        card.setElapsedDays(0);
        card.setScheduledDays(0);
        card.setReps(0);
        card.setLapses(0);
        card.setState(CardState.NEW);
        card.setLastReview(null);
        card.setDue(Instant.now());
        reviewCardRepository.save(card);
    }

    @Transactional(readOnly = true)
    public ReviewCardResponse getCard(Long cardId) {
        ReviewCard card = reviewCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Review card not found with id: " + cardId));
        return toResponse(card);
    }

    @Transactional(readOnly = true)
    public VocabularyItem getVocabularyItemOrThrow(Long vocabularyItemId) {
        return vocabularyRepository.findById(vocabularyItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item not found with id: " + vocabularyItemId));
    }

    @Transactional(readOnly = true)
    public ReviewCard getReviewCardOrThrow(Long cardId) {
        return reviewCardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Review card not found with id: " + cardId));
    }

    @Transactional(readOnly = true)
    public User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private ReviewCard buildReviewCard(Long userId, VocabularyItem item) {
        ReviewCard card = new ReviewCard();
        card.setUserId(userId);
        card.setVocabularyItemId(item.getId());
        card.setStability(0.0);
        card.setDifficulty(0.0);
        card.setElapsedDays(0);
        card.setScheduledDays(0);
        card.setReps(0);
        card.setLapses(0);
        card.setState(CardState.NEW);
        card.setLastReview(null);
        card.setDue(Instant.now());
        card.setRetentionTier(resolveTier(item.getLayer()));
        return card;
    }

    private RetentionTier resolveTier(VocabularyLayer layer) {
        return switch (layer) {
            case EEWL, CSAWL -> RetentionTier.TECHNICAL_CORE;
            case GSL, AWL -> RetentionTier.GENERAL;
        };
    }

    private int computeElapsedDays(Instant previousReview, Instant reviewTime) {
        if (previousReview == null) {
            return 0;
        }
        return (int) Math.max(0, ChronoUnit.DAYS.between(previousReview, reviewTime));
    }

    private void applyState(ReviewCard card, ReviewCardState next, int elapsedDays) {
        card.setStability(next.stability());
        card.setDifficulty(next.difficulty());
        card.setElapsedDays(elapsedDays);
        card.setScheduledDays(next.scheduledDays());
        card.setReps(next.reps());
        card.setLapses(next.lapses());
        card.setState(next.state());
        card.setLastReview(next.lastReview());
        card.setDue(next.due());
    }

    private List<ReviewCardResponse> mapCards(List<ReviewCard> cards) {
        Map<Long, VocabularyResponse> vocabularyById = loadVocabularyMap(
                cards.stream().map(ReviewCard::getVocabularyItemId).collect(Collectors.toSet())
        );
        return cards.stream()
                .map(card -> reviewMapper.toResponse(card, vocabularyById.get(card.getVocabularyItemId())))
                .toList();
    }

    private ReviewCardResponse toResponse(ReviewCard card) {
        VocabularyItem vocabularyItem = vocabularyRepository.findById(card.getVocabularyItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item not found with id: " + card.getVocabularyItemId()));
        return reviewMapper.toResponse(card, vocabularyMapper.toResponse(vocabularyItem));
    }

    private Map<Long, VocabularyResponse> loadVocabularyMap(Set<Long> vocabularyIds) {
        return vocabularyRepository.findAllById(vocabularyIds).stream()
                .collect(Collectors.toMap(VocabularyItem::getId, vocabularyMapper::toResponse));
    }

    private List<ReviewStatsResponse.WeeklyRetentionPoint> computeWeeklyRetention(List<ReviewLog> logs) {
        Map<LocalDate, List<ReviewLog>> byWeek = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getReviewedAt().atZone(ZoneOffset.UTC).toLocalDate().with(java.time.DayOfWeek.MONDAY),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return byWeek.entrySet().stream()
                .map(entry -> {
                    long successful = entry.getValue().stream().filter(log -> log.getGrade() != ReviewGrade.AGAIN).count();
                    double rate = entry.getValue().isEmpty() ? 0.0 : round(successful * 100.0 / entry.getValue().size());
                    return new ReviewStatsResponse.WeeklyRetentionPoint(entry.getKey().toString(), rate);
                })
                .toList();
    }

    private int computeLongestStreak(List<ReviewLog> logs) {
        List<LocalDate> reviewDates = logs.stream()
                .map(log -> log.getReviewedAt().atZone(ZoneOffset.UTC).toLocalDate())
                .distinct()
                .sorted()
                .toList();

        int longest = 0;
        int current = 0;
        LocalDate previous = null;
        for (LocalDate reviewDate : reviewDates) {
            if (previous == null || previous.plusDays(1).equals(reviewDate)) {
                current++;
            } else if (!previous.equals(reviewDate)) {
                current = 1;
            }
            longest = Math.max(longest, current);
            previous = reviewDate;
        }
        return longest;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
