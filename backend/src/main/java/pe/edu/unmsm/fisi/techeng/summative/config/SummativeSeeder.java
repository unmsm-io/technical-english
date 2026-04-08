package pe.edu.unmsm.fisi.techeng.summative.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.summative.entity.SummativeTest;
import pe.edu.unmsm.fisi.techeng.summative.repository.SummativeTestRepository;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;

@Component
@RequiredArgsConstructor
public class SummativeSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(SummativeSeeder.class);

    private final SummativeTestRepository summativeTestRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (summativeTestRepository.count() > 0) {
            logger.info("Summative seed skipped because the table already contains data");
            return;
        }

        try (InputStream inputStream = new ClassPathResource("seeds/summative/tests.json").getInputStream()) {
            List<SummativeSeedItem> items = objectMapper.readValue(inputStream, new TypeReference<>() {});
            summativeTestRepository.saveAll(items.stream().map(SummativeSeedItem::toEntity).toList());
            logger.info("Loaded {} summative tests", items.size());
        }
    }

    private record SummativeSeedItem(
            TaskType taskType,
            CefrLevel cefrLevel,
            String titleEs,
            String descriptionEs,
            String readingSpecEn,
            String readingContextEs,
            String productionInstructionEs,
            String productionExpectedAnswerEn,
            String comprehensionQuestionsJson,
            Integer passingScore,
            Boolean active
    ) {
        private SummativeTest toEntity() {
            SummativeTest test = new SummativeTest();
            test.setTaskType(taskType);
            test.setCefrLevel(cefrLevel);
            test.setTitleEs(titleEs);
            test.setDescriptionEs(descriptionEs);
            test.setReadingSpecEn(readingSpecEn);
            test.setReadingContextEs(readingContextEs);
            test.setProductionInstructionEs(productionInstructionEs);
            test.setProductionExpectedAnswerEn(productionExpectedAnswerEn);
            test.setComprehensionQuestionsJson(comprehensionQuestionsJson);
            test.setPassingScore(passingScore);
            test.setActive(active);
            return test;
        }
    }
}
