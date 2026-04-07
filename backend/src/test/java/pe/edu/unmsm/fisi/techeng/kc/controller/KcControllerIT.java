package pe.edu.unmsm.fisi.techeng.kc.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.kc.config.KcSeedRunner;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.kc.service.KcMappingExtractor;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class KcControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private KnowledgeComponentRepository knowledgeComponentRepository;

    @Autowired
    private ItemKcMappingRepository itemKcMappingRepository;

    @MockBean
    private KcSeedRunner kcSeedRunner;

    @BeforeEach
    void setUp() {
        itemKcMappingRepository.deleteAll();
        knowledgeComponentRepository.deleteAll();

        KnowledgeComponent kc = new KnowledgeComponent();
        kc.setName("passive_voice");
        kc.setNameEs("Voz pasiva");
        kc.setDescription("Passive voice");
        kc.setCategory(KcCategory.GRAMMAR);
        kc.setCefrLevel(CefrLevel.A2);
        kc.setActive(true);
        KnowledgeComponent saved = knowledgeComponentRepository.save(kc);

        ItemKcMapping mapping = new ItemKcMapping();
        mapping.setItemType(KcItemType.DIAGNOSTIC);
        mapping.setItemId(1L);
        mapping.setKcId(saved.getId());
        mapping.setWeight(1.0);
        itemKcMappingRepository.save(mapping);

        when(kcSeedRunner.extractAndPersist()).thenReturn(new KcMappingExtractor.ExtractionSeedData(
                List.of(),
                List.of(),
                42L,
                List.of()
        ));
    }

    @Test
    void shouldListDetailItemsStatsAndExtract() throws Exception {
        Long kcId = knowledgeComponentRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/v1/kc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("passive_voice"));

        mockMvc.perform(get("/api/v1/kc/{id}", kcId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.knowledgeComponent.nameEs").value("Voz pasiva"));

        mockMvc.perform(get("/api/v1/kc/items").param("type", "DIAGNOSTIC").param("itemId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("passive_voice"));

        mockMvc.perform(get("/api/v1/kc/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalKcs").value(1));

        mockMvc.perform(post("/api/v1/kc/extract"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.durationMs").value(42));
    }
}
