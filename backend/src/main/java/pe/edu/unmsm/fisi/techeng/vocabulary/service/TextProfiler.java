package pe.edu.unmsm.fisi.techeng.vocabulary.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.ProfileResult;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.ProfileTokenResponse;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TextProfiler {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("`[^`]+`|--[a-zA-Z][a-zA-Z0-9-]*|-[a-zA-Z]|[A-Za-z][A-Za-z0-9._-]*");

    private final TokenClassifier tokenClassifier;
    private final VocabularyService vocabularyService;

    public ProfileResult profile(String text) {
        List<String> rawTokens = extractTokens(text);
        List<String> protectedTokens = new ArrayList<>();
        List<String> learnableTokens = new ArrayList<>();
        Set<String> learnableVocabularyTerms = new LinkedHashSet<>();
        List<TokenSnapshot> tokenSnapshots = new ArrayList<>();

        for (String token : rawTokens) {
            String normalized = normalizeToken(token);
            if (normalized.isBlank()) {
                continue;
            }
            if (tokenClassifier.isProtected(token)) {
                protectedTokens.add(token);
                tokenSnapshots.add(new TokenSnapshot(token, normalized, "PROTECTED"));
                continue;
            }
            learnableTokens.add(token);
            learnableVocabularyTerms.add(normalized);
            tokenSnapshots.add(new TokenSnapshot(token, normalized, null));
        }

        Set<String> knownTerms = vocabularyService.findByTerms(learnableVocabularyTerms).stream()
                .map(VocabularyItem::getTerm)
                .map(this::normalizeToken)
                .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

        Set<String> unknownTerms = new LinkedHashSet<>();
        int knownCount = 0;
        List<ProfileTokenResponse> tokenResponses = new ArrayList<>();

        for (TokenSnapshot snapshot : tokenSnapshots) {
            if ("PROTECTED".equals(snapshot.status())) {
                tokenResponses.add(new ProfileTokenResponse(snapshot.value(), snapshot.normalizedValue(), snapshot.status()));
                continue;
            }
            boolean known = knownTerms.contains(snapshot.normalizedValue());
            if (known) {
                knownCount++;
            } else {
                unknownTerms.add(snapshot.normalizedValue());
            }
            tokenResponses.add(new ProfileTokenResponse(snapshot.value(), snapshot.normalizedValue(), known ? "KNOWN" : "UNKNOWN"));
        }

        double knownPercentage = learnableTokens.isEmpty()
                ? 100.0
                : (knownCount * 100.0) / learnableTokens.size();

        return new ProfileResult(
                rawTokens.size(),
                protectedTokens,
                learnableTokens,
                knownCount,
                new ArrayList<>(unknownTerms),
                Math.round(knownPercentage * 100.0) / 100.0,
                knownPercentage >= 95.0,
                tokenResponses
        );
    }

    private List<String> extractTokens(String text) {
        List<String> tokens = new ArrayList<>();
        Matcher matcher = TOKEN_PATTERN.matcher(text == null ? "" : text);
        while (matcher.find()) {
            tokens.add(matcher.group());
        }
        return tokens;
    }

    private String normalizeToken(String token) {
        return token
                .replace("`", "")
                .replaceAll("^[^A-Za-z]+|[^A-Za-z]+$", "")
                .toLowerCase(Locale.ROOT);
    }

    private record TokenSnapshot(String value, String normalizedValue, String status) {}
}
