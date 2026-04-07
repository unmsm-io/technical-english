package pe.edu.unmsm.fisi.techeng.vocabulary.dto;

import java.util.List;

public record ProfileResult(
        Integer totalTokens,
        List<String> protectedTokens,
        List<String> learnableTokens,
        Integer knownCount,
        List<String> unknownTerms,
        Double knownPercentage,
        Boolean meetsThreshold,
        List<ProfileTokenResponse> tokens
) {}
