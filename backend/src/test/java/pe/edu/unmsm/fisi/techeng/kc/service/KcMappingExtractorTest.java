package pe.edu.unmsm.fisi.techeng.kc.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticItem;
import pe.edu.unmsm.fisi.techeng.diagnostic.entity.DiagnosticSkill;
import pe.edu.unmsm.fisi.techeng.diagnostic.repository.DiagnosticItemRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.task.entity.Task;
import pe.edu.unmsm.fisi.techeng.task.entity.TaskType;
import pe.edu.unmsm.fisi.techeng.task.repository.TaskRepository;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@ExtendWith(MockitoExtension.class)
class KcMappingExtractorTest {

    @Mock
    private DiagnosticItemRepository diagnosticItemRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer server;
    private KcMappingExtractor kcMappingExtractor;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder();
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
        kcMappingExtractor = new KcMappingExtractor(
                restClientBuilder,
                new ObjectMapper(),
                diagnosticItemRepository,
                taskRepository,
                vocabularyRepository
        );
        ReflectionTestUtils.setField(kcMappingExtractor, "apiKey", "test-key");
        ReflectionTestUtils.setField(kcMappingExtractor, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(kcMappingExtractor, "baseUrl", "https://llm.test");
    }

    @Test
    void extractAllShouldParseAndDedupeKnowledgeComponents() {
        when(diagnosticItemRepository.findAllByOrderByIdAsc()).thenReturn(List.of(diagnosticItem()));
        when(taskRepository.findAll()).thenReturn(List.of(task()));
        when(vocabularyRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 100)))
                .thenReturn(new PageImpl<>(List.of(vocabularyItem())));

        String payload = """
                {
                  "choices": [
                    {
                      "message": {
                        "content": "{\\"kcs\\":[{\\"name\\":\\"passive_voice\\",\\"nameEs\\":\\"Voz pasiva\\",\\"description\\":\\"Passive voice\\",\\"category\\":\\"GRAMMAR\\",\\"weight\\":1.0},{\\"name\\":\\"passive_voice\\",\\"nameEs\\":\\"Voz pasiva\\",\\"description\\":\\"Duplicate\\",\\"category\\":\\"GRAMMAR\\",\\"weight\\":0.5}]}"
                      }
                    }
                  ]
                }
                """;

        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://llm.test/chat/completions"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));

        KcMappingExtractor.ExtractionSeedData result = kcMappingExtractor.extractAll();

        assertThat(result.knowledgeComponents()).hasSize(1);
        assertThat(result.mappings()).hasSize(3);
        assertThat(result.mappings().get(0).kcs()).hasSize(1);
        assertThat(result.knowledgeComponents().get(0).name()).isEqualTo("passive_voice");
        server.verify();
    }

    private DiagnosticItem diagnosticItem() {
        DiagnosticItem item = new DiagnosticItem();
        item.setId(1L);
        item.setCefrLevel(CefrLevel.A2);
        item.setSkill(DiagnosticSkill.READING);
        item.setQuestionText("Read the error");
        item.setOptionsJson("[]");
        item.setCorrectAnswerIdx(0);
        item.setExplanationEs("Explanation");
        return item;
    }

    private Task task() {
        Task task = new Task();
        task.setId(2L);
        task.setTaskType(TaskType.ERROR_MESSAGE);
        task.setCefrLevel(CefrLevel.B1);
        task.setTitleEs("Task");
        task.setDuringTaskPromptEn("Prompt");
        task.setPostTaskLanguageFocus("Focus");
        return task;
    }

    private VocabularyItem vocabularyItem() {
        VocabularyItem item = new VocabularyItem();
        item.setId(3L);
        item.setTerm("buffer");
        item.setDefinition("temporary storage");
        item.setExampleSentence("A buffer stores bytes.");
        item.setCefrLevel(CefrLevel.B1);
        item.setLayer(VocabularyLayer.CSAWL);
        item.setFrequency(5);
        item.setPartOfSpeech("noun");
        return item;
    }
}
