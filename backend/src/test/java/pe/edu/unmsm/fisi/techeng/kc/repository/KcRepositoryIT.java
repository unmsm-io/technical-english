package pe.edu.unmsm.fisi.techeng.kc.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class KcRepositoryIT {

    @Autowired
    private KnowledgeComponentRepository knowledgeComponentRepository;

    @Test
    void searchShouldHandleNullQueryWithCastSyntax() {
        KnowledgeComponent kc = new KnowledgeComponent();
        kc.setName("error_messages_reading");
        kc.setNameEs("Lectura de mensajes de error");
        kc.setDescription("Needle");
        kc.setCategory(KcCategory.READING_COMPREHENSION);
        kc.setCefrLevel(CefrLevel.A2);
        kc.setActive(true);
        knowledgeComponentRepository.save(kc);

        Page<KnowledgeComponent> all = knowledgeComponentRepository.search(null, null, null, PageRequest.of(0, 10));
        Page<KnowledgeComponent> filtered = knowledgeComponentRepository.search(
                KcCategory.READING_COMPREHENSION,
                CefrLevel.A2,
                "Needle",
                PageRequest.of(0, 10)
        );

        assertThat(all.getContent()).extracting(KnowledgeComponent::getName).contains("error_messages_reading");
        assertThat(filtered.getContent()).extracting(KnowledgeComponent::getName).contains("error_messages_reading");
    }
}
