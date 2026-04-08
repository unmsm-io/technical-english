package pe.edu.unmsm.fisi.techeng.kc.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
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
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcResponseLogRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MasteryControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private KnowledgeComponentRepository knowledgeComponentRepository;

    @Autowired
    private ItemKcMappingRepository itemKcMappingRepository;

    @Autowired
    private KcMasteryStateRepository kcMasteryStateRepository;

    @Autowired
    private KcResponseLogRepository kcResponseLogRepository;

    @MockBean
    private KcSeedRunner kcSeedRunner;

    @BeforeEach
    void setUp() {
        kcResponseLogRepository.deleteAll();
        kcMasteryStateRepository.deleteAll();
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

        KcMasteryState state = new KcMasteryState();
        state.setUserId(1L);
        state.setKcId(saved.getId());
        state.setPLearned(0.97);
        state.setTotalResponses(3);
        state.setCorrectResponses(3);
        state.setMasteredAt(Instant.now());
        kcMasteryStateRepository.save(state);

        KcResponseLog log = new KcResponseLog();
        log.setUserId(1L);
        log.setKcId(saved.getId());
        log.setItemType(KcItemType.TASK);
        log.setItemId(7L);
        log.setCorrect(true);
        log.setPLearnedBefore(0.8);
        log.setPLearnedAfter(0.97);
        log.setRespondedAt(Instant.now());
        kcResponseLogRepository.save(log);

        ItemKcMapping mapping = new ItemKcMapping();
        mapping.setItemType(KcItemType.TASK);
        mapping.setItemId(7L);
        mapping.setKcId(saved.getId());
        mapping.setWeight(1.0);
        itemKcMappingRepository.save(mapping);
    }

    @Test
    void shouldExposeRadarDetailMasteredCountAndRecompute() throws Exception {
        Long kcId = knowledgeComponentRepository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/v1/mastery/users/1/radar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.masteredCount").value(1))
                .andExpect(jsonPath("$.data.kcs[0].kcName").value("passive_voice"));

        mockMvc.perform(get("/api/v1/mastery/users/1/kcs/{kcId}", kcId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.history[0].itemType").value("TASK"));

        mockMvc.perform(get("/api/v1/mastery/users/1/mastered-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(1));

        mockMvc.perform(post("/api/v1/mastery/users/1/recompute"))
                .andExpect(status().isNoContent());
    }
}
