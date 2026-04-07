package pe.edu.unmsm.fisi.techeng.kc.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcCategory;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.mapper.KcMapper;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcResponseLogRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;

@ExtendWith(MockitoExtension.class)
class MasteryServiceTest {

    @Mock
    private ItemKcMappingRepository itemKcMappingRepository;

    @Mock
    private KcMasteryStateRepository kcMasteryStateRepository;

    @Mock
    private KcResponseLogRepository kcResponseLogRepository;

    @Mock
    private KnowledgeComponentRepository knowledgeComponentRepository;

    private MasteryService masteryService;

    @BeforeEach
    void setUp() {
        masteryService = new MasteryService(
                itemKcMappingRepository,
                kcMasteryStateRepository,
                kcResponseLogRepository,
                knowledgeComponentRepository,
                new KcMapper(),
                new BktUpdater()
        );
    }

    @Test
    void recordResponseShouldPersistStateAndLog() {
        KnowledgeComponent knowledgeComponent = kc(11L, "passive_voice", 0.1);
        ItemKcMapping mapping = mapping(11L, 90L);

        when(itemKcMappingRepository.findByItemTypeAndItemId(KcItemType.TASK, 90L)).thenReturn(List.of(mapping));
        when(knowledgeComponentRepository.findAllById(List.of(11L))).thenReturn(List.of(knowledgeComponent));
        when(kcMasteryStateRepository.findByUserIdAndKcId(5L, 11L)).thenReturn(Optional.empty());
        when(kcMasteryStateRepository.save(any(KcMasteryState.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(kcResponseLogRepository.save(any(KcResponseLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        masteryService.recordResponse(5L, KcItemType.TASK, 90L, true);

        ArgumentCaptor<KcMasteryState> stateCaptor = ArgumentCaptor.forClass(KcMasteryState.class);
        ArgumentCaptor<KcResponseLog> logCaptor = ArgumentCaptor.forClass(KcResponseLog.class);
        verify(kcMasteryStateRepository).save(stateCaptor.capture());
        verify(kcResponseLogRepository).save(logCaptor.capture());

        assertThat(stateCaptor.getValue().getPLearned()).isGreaterThan(0.5);
        assertThat(stateCaptor.getValue().getCorrectResponses()).isEqualTo(1);
        assertThat(logCaptor.getValue().getPLearnedAfter()).isEqualTo(stateCaptor.getValue().getPLearned());
        assertThat(logCaptor.getValue().isCorrect()).isTrue();
    }

    @Test
    void recordResponseShouldUpdateAllMappedKcs() {
        KnowledgeComponent first = kc(11L, "passive_voice", 0.1);
        KnowledgeComponent second = kc(12L, "modal_verbs", 0.1);

        when(itemKcMappingRepository.findByItemTypeAndItemId(KcItemType.DIAGNOSTIC, 7L))
                .thenReturn(List.of(mapping(11L, 7L), mapping(12L, 7L)));
        when(knowledgeComponentRepository.findAllById(List.of(11L, 12L))).thenReturn(List.of(first, second));
        when(kcMasteryStateRepository.findByUserIdAndKcId(3L, 11L)).thenReturn(Optional.empty());
        when(kcMasteryStateRepository.findByUserIdAndKcId(3L, 12L)).thenReturn(Optional.empty());
        when(kcMasteryStateRepository.save(any(KcMasteryState.class))).thenAnswer(invocation -> invocation.getArgument(0));

        masteryService.recordResponse(3L, KcItemType.DIAGNOSTIC, 7L, false);

        verify(kcMasteryStateRepository, times(2)).save(any(KcMasteryState.class));
        verify(kcResponseLogRepository, times(2)).save(any(KcResponseLog.class));
    }

    @Test
    void recordResponseShouldSetMasteredAtWhenThresholdIsReached() {
        KnowledgeComponent knowledgeComponent = kc(11L, "passive_voice", 0.1);
        KcMasteryState state = new KcMasteryState();
        state.setUserId(5L);
        state.setKcId(11L);
        state.setPLearned(0.94);

        when(itemKcMappingRepository.findByItemTypeAndItemId(KcItemType.VOCABULARY, 44L))
                .thenReturn(List.of(mapping(11L, 44L)));
        when(knowledgeComponentRepository.findAllById(List.of(11L))).thenReturn(List.of(knowledgeComponent));
        when(kcMasteryStateRepository.findByUserIdAndKcId(5L, 11L)).thenReturn(Optional.of(state));
        when(kcMasteryStateRepository.save(any(KcMasteryState.class))).thenAnswer(invocation -> invocation.getArgument(0));

        masteryService.recordResponse(5L, KcItemType.VOCABULARY, 44L, true);

        ArgumentCaptor<KcMasteryState> captor = ArgumentCaptor.forClass(KcMasteryState.class);
        verify(kcMasteryStateRepository).save(captor.capture());
        assertThat(captor.getValue().getMasteredAt()).isNotNull();
    }

    @Test
    void getMasteryRadarShouldIncludeDefaultStatesForUntouchedKcs() {
        KnowledgeComponent first = kc(11L, "passive_voice", 0.1);
        KnowledgeComponent second = kc(12L, "modal_verbs", 0.2);
        KcMasteryState state = new KcMasteryState();
        state.setUserId(5L);
        state.setKcId(11L);
        state.setPLearned(0.98);
        state.setTotalResponses(4);
        state.setCorrectResponses(4);

        when(knowledgeComponentRepository.findAll()).thenReturn(List.of(first, second));
        when(kcMasteryStateRepository.findByUserId(5L)).thenReturn(List.of(state));

        MasteryRadarResponse response = masteryService.getMasteryRadar(5L);

        assertThat(response.totalKcs()).isEqualTo(2);
        assertThat(response.masteredCount()).isEqualTo(1);
        assertThat(response.kcs()).hasSize(2);
        assertThat(response.kcs().stream().filter(entry -> entry.kcId().equals(12L)).findFirst().orElseThrow().pLearned())
                .isEqualTo(0.2);
    }

    @Test
    void getKcDetailShouldReturnHistoryAndRelatedItems() {
        KnowledgeComponent knowledgeComponent = kc(11L, "passive_voice", 0.1);
        KcMasteryState state = new KcMasteryState();
        state.setUserId(5L);
        state.setKcId(11L);
        state.setPLearned(0.7);

        KcResponseLog log = new KcResponseLog();
        log.setId(100L);
        log.setKcId(11L);
        log.setItemId(90L);
        log.setItemType(KcItemType.TASK);
        log.setCorrect(true);
        log.setPLearnedBefore(0.5);
        log.setPLearnedAfter(0.7);
        log.setRespondedAt(java.time.Instant.now());

        when(knowledgeComponentRepository.findById(11L)).thenReturn(Optional.of(knowledgeComponent));
        when(kcMasteryStateRepository.findByUserIdAndKcId(5L, 11L)).thenReturn(Optional.of(state));
        when(kcResponseLogRepository.findByUserIdAndKcIdOrderByRespondedAtDesc(5L, 11L, org.springframework.data.domain.PageRequest.of(0, 30)))
                .thenReturn(List.of(log));
        when(itemKcMappingRepository.findByKcId(11L)).thenReturn(List.of(mapping(11L, 90L)));

        KcMasteryDetailResponse response = masteryService.getKcDetail(5L, 11L);

        assertThat(response.history()).hasSize(1);
        assertThat(response.relatedItems()).hasSize(1);
        assertThat(response.state().pLearned()).isEqualTo(0.7);
    }

    private KnowledgeComponent kc(Long id, String name, double pInitialLearned) {
        KnowledgeComponent knowledgeComponent = new KnowledgeComponent();
        knowledgeComponent.setId(id);
        knowledgeComponent.setName(name);
        knowledgeComponent.setNameEs(name);
        knowledgeComponent.setDescription(name);
        knowledgeComponent.setCategory(KcCategory.GRAMMAR);
        knowledgeComponent.setCefrLevel(CefrLevel.A2);
        knowledgeComponent.setPInitialLearned(pInitialLearned);
        knowledgeComponent.setPTransition(0.3);
        knowledgeComponent.setPGuess(0.2);
        knowledgeComponent.setPSlip(0.1);
        knowledgeComponent.setActive(true);
        return knowledgeComponent;
    }

    private ItemKcMapping mapping(Long kcId, Long itemId) {
        ItemKcMapping mapping = new ItemKcMapping();
        mapping.setKcId(kcId);
        mapping.setItemId(itemId);
        mapping.setItemType(KcItemType.TASK);
        mapping.setWeight(1.0);
        return mapping;
    }
}
