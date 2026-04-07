package pe.edu.unmsm.fisi.techeng.calibration.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pe.edu.unmsm.fisi.techeng.calibration.dto.CalibrationRunResponse;
import pe.edu.unmsm.fisi.techeng.calibration.service.CalibrationService;

@Component
@Slf4j
@ConditionalOnProperty(prefix = "calibration", name = "enabled", havingValue = "true", matchIfMissing = true)
public class CalibrationJob {

    private final CalibrationService calibrationService;

    public CalibrationJob(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @Scheduled(cron = "0 30 3 * * *")
    public void runCalibrationCycle() {
        CalibrationRunResponse result = calibrationService.runCalibrationCycle();
        log.info(
                "Calibration cycle completed: itemsCalibrated={}, itemsConverged={}, durationMs={}",
                result.itemsCalibrated(),
                result.itemsConverged(),
                result.durationMs()
        );
    }
}
