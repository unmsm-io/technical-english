package pe.edu.unmsm.fisi.techeng.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VocabularyControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Test
    void list_shouldFilterByLayerAndQuery() throws Exception {
        assertThat(vocabularyRepository.count()).isEqualTo(800);

        mockMvc.perform(get("/api/v1/vocabulary")
                        .param("layer", "AWL")
                        .param("q", "analysis")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].term").value("analysis"))
                .andExpect(jsonPath("$.data.content[0].layer").value("AWL"))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.size").value(5));
    }

    @Test
    void getById_shouldReturnDetail() throws Exception {
        VocabularyItem item = vocabularyRepository.findAll().stream()
                .filter(vocabularyItem -> vocabularyItem.getLayer().name().equals("CSAWL"))
                .filter(vocabularyItem -> vocabularyItem.getTerm().equals("algorithm"))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(get("/api/v1/vocabulary/{id}", item.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.term").value("algorithm"))
                .andExpect(jsonPath("$.data.layer").value("CSAWL"))
                .andExpect(jsonPath("$.data.definition").isNotEmpty());
    }
}
