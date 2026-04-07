package pe.edu.unmsm.fisi.techeng.review.scheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.review.repository.ReviewLogRepository;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "review.maintenance", name = "enabled", havingValue = "true", matchIfMissing = true)
public class ReviewMaintenanceJob {

    private final ReviewLogRepository reviewLogRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupStaleLogs() {
        Instant cutoff = Instant.now().minus(90, ChronoUnit.DAYS);
        int deleted = reviewLogRepository.deleteByReviewedAtBefore(cutoff);
        log.info("Maintenance run: cleaned {} stale review logs", deleted);
    }
}
