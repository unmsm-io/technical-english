package pe.edu.unmsm.fisi.techeng.vocabulary.service;

import java.util.Collection;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.VocabularyResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.mapper.VocabularyMapper;
import pe.edu.unmsm.fisi.techeng.vocabulary.repository.VocabularyRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final VocabularyMapper vocabularyMapper;

    @Transactional(readOnly = true)
    public Page<VocabularyResponse> list(VocabularyLayer layer, CefrLevel cefrLevel, String query, Pageable pageable) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        return vocabularyRepository.search(layer, cefrLevel, normalizedQuery, pageable)
                .map(vocabularyMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public VocabularyResponse getById(Long id) {
        VocabularyItem item = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary item not found with id: " + id));
        return vocabularyMapper.toResponse(item);
    }

    @Transactional(readOnly = true)
    public List<VocabularyItem> findByTerms(Collection<String> terms) {
        if (terms == null || terms.isEmpty()) {
            return List.of();
        }
        List<String> normalizedTerms = terms.stream()
                .filter(term -> term != null && !term.isBlank())
                .map(term -> term.trim().toLowerCase(Locale.ROOT))
                .distinct()
                .toList();
        if (normalizedTerms.isEmpty()) {
            return List.of();
        }
        return vocabularyRepository.findByNormalizedTerms(normalizedTerms);
    }
}
