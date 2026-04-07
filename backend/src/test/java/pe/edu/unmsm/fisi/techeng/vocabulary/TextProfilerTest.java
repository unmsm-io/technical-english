package pe.edu.unmsm.fisi.techeng.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import pe.edu.unmsm.fisi.techeng.shared.enums.CefrLevel;
import pe.edu.unmsm.fisi.techeng.vocabulary.dto.ProfileResult;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyItem;
import pe.edu.unmsm.fisi.techeng.vocabulary.entity.VocabularyLayer;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TextProfiler;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.VocabularyService;

class TextProfilerTest {

    private final VocabularyService vocabularyService = Mockito.mock(VocabularyService.class);
    private TextProfiler textProfiler;

    @BeforeEach
    void setUp() {
        textProfiler = new TextProfiler(new TokenClassifier(), vocabularyService);
    }

    @Test
    void shouldTreatProtectedTokensOutsideThreshold() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("analysis"), vocabulary("queue")));

        ProfileResult result = textProfiler.profile("analysis queue --verbose NullPointerException");

        assertThat(result.protectedTokens()).containsExactly("--verbose", "NullPointerException");
        assertThat(result.knownCount()).isEqualTo(2);
        assertThat(result.knownPercentage()).isEqualTo(100.0);
        assertThat(result.meetsThreshold()).isTrue();
    }

    @Test
    void shouldFlagUnknownTermsAndFailThresholdAtBoundary() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(
                        vocabulary("access"),
                        vocabulary("build"),
                        vocabulary("change"),
                        vocabulary("check"),
                        vocabulary("clean"),
                        vocabulary("analysis"),
                        vocabulary("approach"),
                        vocabulary("assessment"),
                        vocabulary("assume"),
                        vocabulary("latency"),
                        vocabulary("throughput"),
                        vocabulary("deployment"),
                        vocabulary("debugger"),
                        vocabulary("algorithmic"),
                        vocabulary("compliance"),
                        vocabulary("queue"),
                        vocabulary("sensor"),
                        vocabulary("report"),
                        vocabulary("system")
                ));

        ProfileResult result = textProfiler.profile("""
                access build change check clean analysis approach assessment assume latency
                throughput deployment debugger algorithmic compliance queue sensor report system unknownterm
                """);

        assertThat(result.learnableTokens()).hasSize(20);
        assertThat(result.knownCount()).isEqualTo(19);
        assertThat(result.knownPercentage()).isEqualTo(95.0);
        assertThat(result.meetsThreshold()).isTrue();
        assertThat(result.unknownTerms()).containsExactly("unknownterm");
    }

    @Test
    void shouldFailWhenCoverageDropsBelowThreshold() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("access"), vocabulary("build"), vocabulary("change")));

        ProfileResult result = textProfiler.profile("access build change unstable queue");

        assertThat(result.knownCount()).isEqualTo(3);
        assertThat(result.knownPercentage()).isEqualTo(60.0);
        assertThat(result.meetsThreshold()).isFalse();
        assertThat(result.unknownTerms()).containsExactly("unstable", "queue");
    }

    @Test
    void shouldReturnHundredPercentWhenOnlyProtectedTokensAppear() {
        when(vocabularyService.findByTerms(Mockito.anyCollection())).thenReturn(List.of());

        ProfileResult result = textProfiler.profile("`IOException` --help config.yml");

        assertThat(result.learnableTokens()).isEmpty();
        assertThat(result.knownPercentage()).isEqualTo(100.0);
        assertThat(result.meetsThreshold()).isTrue();
    }

    @Test
    void shouldNormalizePunctuationAroundTokens() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("analysis"), vocabulary("report")));

        ProfileResult result = textProfiler.profile("analysis, report.");

        assertThat(result.knownCount()).isEqualTo(2);
        assertThat(result.unknownTerms()).isEmpty();
    }

    @Test
    void shouldKeepTokenOrderForFrontendHighlighting() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("analysis")));

        ProfileResult result = textProfiler.profile("analysis --verbose queue");

        assertThat(result.tokens().get(0).status()).isEqualTo("KNOWN");
        assertThat(result.tokens().get(1).status()).isEqualTo("PROTECTED");
        assertThat(result.tokens().get(2).status()).isEqualTo("UNKNOWN");
    }

    @Test
    void shouldCollectUniqueUnknownTerms() {
        when(vocabularyService.findByTerms(Mockito.anyCollection())).thenReturn(List.of());

        ProfileResult result = textProfiler.profile("queue queue queue");

        assertThat(result.unknownTerms()).containsExactly("queue");
    }

    @Test
    void shouldIgnoreBlankText() {
        when(vocabularyService.findByTerms(Mockito.anyCollection())).thenReturn(List.of());

        ProfileResult result = textProfiler.profile("   ");

        assertThat(result.totalTokens()).isEqualTo(0);
        assertThat(result.knownPercentage()).isEqualTo(100.0);
    }

    @Test
    void shouldDetectBacktickQuotedTokenAsProtected() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("analysis")));

        ProfileResult result = textProfiler.profile("analysis `stack trace` queue");

        assertThat(result.protectedTokens()).containsExactly("`stack trace`");
    }

    @Test
    void shouldCountRepeatedKnownTokens() {
        when(vocabularyService.findByTerms(Mockito.anyCollection()))
                .thenReturn(List.of(vocabulary("access")));

        ProfileResult result = textProfiler.profile("access access access");

        assertThat(result.knownCount()).isEqualTo(3);
        assertThat(result.knownPercentage()).isEqualTo(100.0);
    }

    private VocabularyItem vocabulary(String term) {
        VocabularyItem item = new VocabularyItem();
        item.setTerm(term);
        item.setDefinition("definition");
        item.setCefrLevel(CefrLevel.B1);
        item.setLayer(VocabularyLayer.AWL);
        item.setFrequency(1);
        item.setPartOfSpeech("noun");
        item.setExampleSentence("example");
        item.setProtectedToken(false);
        return item;
    }
}
