package pe.edu.unmsm.fisi.techeng.kc.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryDetailResponse;
import pe.edu.unmsm.fisi.techeng.kc.dto.KcMasteryEntry;
import pe.edu.unmsm.fisi.techeng.kc.dto.MasteryRadarResponse;
import pe.edu.unmsm.fisi.techeng.kc.entity.ItemKcMapping;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcItemType;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcMasteryState;
import pe.edu.unmsm.fisi.techeng.kc.entity.KcResponseLog;
import pe.edu.unmsm.fisi.techeng.kc.entity.KnowledgeComponent;
import pe.edu.unmsm.fisi.techeng.kc.mapper.KcMapper;
import pe.edu.unmsm.fisi.techeng.kc.repository.ItemKcMappingRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcMasteryStateRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KcResponseLogRepository;
import pe.edu.unmsm.fisi.techeng.kc.repository.KnowledgeComponentRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;

/**
 * Updates BKT state when new responses arrive from any source (diagnostic,
 * task, vocabulary review). Polymorphic via ItemKcMapping which links any item
 * type to KCs. Threshold-aware: persists masteredAt timestamp first time
 * pLearned crosses 0.95.
 */
@Service
@RequiredArgsConstructor
public class MasteryService {

    public static final double MASTERY_THRESHOLD = 0.95;

    private final ItemKcMappingRepository itemKcMappingRepository;
    private final KcMasteryStateRepository kcMasteryStateRepository;
    private final KcResponseLogRepository kcResponseLogRepository;
    private final KnowledgeComponentRepository knowledgeComponentRepository;
    private final KcMapper kcMapper;
    private final BktUpdater bktUpdater;

    @Transactional
    public void recordResponse(Long userId, KcItemType itemType, Long itemId, boolean correct) {
        List<ItemKcMapping> mappings = itemKcMappingRepository.findByItemTypeAndItemId(itemType, itemId);
        if (mappings.isEmpty()) {
            return;
        }

        Instant respondedAt = Instant.now();
        Map<Long, KnowledgeComponent> knowledgeComponents = knowledgeComponentRepository.findAllById(
                mappings.stream().map(ItemKcMapping::getKcId).toList()
        ).stream().collect(Collectors.toMap(KnowledgeComponent::getId, Function.identity()));

        for (ItemKcMapping mapping : mappings) {
            KnowledgeComponent knowledgeComponent = knowledgeComponents.get(mapping.getKcId());
            if (knowledgeComponent == null) {
                continue;
            }

            KcMasteryState state = kcMasteryStateRepository.findByUserIdAndKcId(userId, knowledgeComponent.getId())
                    .orElseGet(() -> newState(userId, knowledgeComponent));

            double before = state.getPLearned();
            double after = bktUpdater.update(
                    before,
                    correct,
                    knowledgeComponent.getPTransition(),
                    knowledgeComponent.getPGuess(),
                    knowledgeComponent.getPSlip()
            );

            state.setPLearned(after);
            state.setTotalResponses(state.getTotalResponses() + 1);
            if (correct) {
                state.setCorrectResponses(state.getCorrectResponses() + 1);
                state.setConsecutiveCorrect(state.getConsecutiveCorrect() + 1);
                state.setConsecutiveIncorrect(0);
            } else {
                state.setConsecutiveIncorrect(state.getConsecutiveIncorrect() + 1);
                state.setConsecutiveCorrect(0);
            }
            state.setLastResponseAt(respondedAt);
            if (after >= MASTERY_THRESHOLD && state.getMasteredAt() == null) {
                state.setMasteredAt(respondedAt);
            }

            kcMasteryStateRepository.save(state);

            KcResponseLog responseLog = new KcResponseLog();
            responseLog.setUserId(userId);
            responseLog.setKcId(knowledgeComponent.getId());
            responseLog.setItemType(itemType);
            responseLog.setItemId(itemId);
            responseLog.setCorrect(correct);
            responseLog.setPLearnedBefore(before);
            responseLog.setPLearnedAfter(after);
            responseLog.setRespondedAt(respondedAt);
            kcResponseLogRepository.save(responseLog);
        }
    }

    @Transactional(readOnly = true)
    public MasteryRadarResponse getMasteryRadar(Long userId) {
        List<KnowledgeComponent> knowledgeComponents = knowledgeComponentRepository.findAll().stream()
                .filter(KnowledgeComponent::isActive)
                .sorted(Comparator.comparing(KnowledgeComponent::getNameEs))
                .toList();
        Map<Long, KcMasteryState> statesByKcId = kcMasteryStateRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(KcMasteryState::getKcId, Function.identity()));

        List<KcMasteryEntry> entries = knowledgeComponents.stream()
                .map(kc -> {
                    KcMasteryState state = statesByKcId.getOrDefault(kc.getId(), defaultState(userId, kc));
                    return kcMapper.toMasteryEntry(kc, state);
                })
                .toList();

        Instant lastUpdate = statesByKcId.values().stream()
                .map(KcMasteryState::getLastResponseAt)
                .filter(java.util.Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new MasteryRadarResponse(
                userId,
                entries,
                entries.stream().filter(entry -> entry.pLearned() >= MASTERY_THRESHOLD).count(),
                entries.size(),
                lastUpdate
        );
    }

    @Transactional(readOnly = true)
    public KcMasteryDetailResponse getKcDetail(Long userId, Long kcId) {
        KnowledgeComponent knowledgeComponent = knowledgeComponentRepository.findById(kcId)
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge component not found with id: " + kcId));
        KcMasteryState state = kcMasteryStateRepository.findByUserIdAndKcId(userId, kcId)
                .orElseGet(() -> defaultState(userId, knowledgeComponent));
        List<KcResponseLog> history = kcResponseLogRepository.findByUserIdAndKcIdOrderByRespondedAtDesc(
                userId,
                kcId,
                PageRequest.of(0, 30)
        );
        List<ItemKcMapping> relatedItems = itemKcMappingRepository.findByKcId(kcId);
        return kcMapper.toMasteryDetailResponse(knowledgeComponent, state, history, relatedItems);
    }

    @Transactional(readOnly = true)
    public Long countMasteredKcs(Long userId) {
        return (long) kcMasteryStateRepository.findMasteredByUserId(userId, MASTERY_THRESHOLD).size();
    }

    @Transactional
    public void recompute(Long userId) {
        kcMasteryStateRepository.deleteByUserId(userId);
        List<KcResponseLog> logs = kcResponseLogRepository.findByUserIdOrderByRespondedAtAsc(userId);
        for (KcResponseLog log : logs) {
            recordResponse(userId, log.getItemType(), log.getItemId(), log.isCorrect());
        }
    }

    private KcMasteryState newState(Long userId, KnowledgeComponent knowledgeComponent) {
        KcMasteryState state = new KcMasteryState();
        state.setUserId(userId);
        state.setKcId(knowledgeComponent.getId());
        state.setPLearned(knowledgeComponent.getPInitialLearned());
        return state;
    }

    private KcMasteryState defaultState(Long userId, KnowledgeComponent knowledgeComponent) {
        return newState(userId, knowledgeComponent);
    }
}
