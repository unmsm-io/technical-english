package pe.edu.unmsm.fisi.techeng.review.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewGrade;
import pe.edu.unmsm.fisi.techeng.review.entity.ReviewLog;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    long countByUserIdAndReviewedAtGreaterThanEqual(Long userId, Instant reviewedAt);

    long countByUserIdAndGradeNotAndReviewedAtGreaterThanEqual(Long userId, ReviewGrade grade, Instant reviewedAt);

    List<ReviewLog> findTop120ByUserIdOrderByReviewedAtDesc(Long userId);

    @Query("""
            select l
            from ReviewLog l
            where l.userId = :userId
              and l.reviewedAt >= :reviewedAfter
            order by l.reviewedAt asc
            """)
    List<ReviewLog> findReviewedSince(
            @Param("userId") Long userId,
            @Param("reviewedAfter") Instant reviewedAfter
    );

    @Modifying
    @Query("""
            delete from ReviewLog l
            where l.reviewedAt < :cutoff
            """)
    int deleteByReviewedAtBefore(@Param("cutoff") Instant cutoff);
}
