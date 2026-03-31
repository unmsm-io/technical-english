package pe.edu.unmsm.fisi.techeng.analytics.service;

import pe.edu.unmsm.fisi.techeng.analytics.dto.UserStatsResponse;
import pe.edu.unmsm.fisi.techeng.practice.repository.AttemptRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public UserStatsResponse getUserStats(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        long total = attemptRepository.countByUserId(userId);
        long correct = attemptRepository.countByUserIdAndCorrectTrue(userId);
        Double avg = attemptRepository.averageScoreByUser(userId);
        double accuracy = total > 0 ? (double) correct / total * 100 : 0;

        return new UserStatsResponse(userId, total, correct, avg, accuracy);
    }
}
