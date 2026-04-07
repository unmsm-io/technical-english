package pe.edu.unmsm.fisi.techeng.vocabulary;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import pe.edu.unmsm.fisi.techeng.vocabulary.service.TokenClassifier;

class TokenClassifierTest {

    private final TokenClassifier tokenClassifier = new TokenClassifier();

    @ParameterizedTest
    @CsvSource({
            "camelCase,true",
            "snake_case,true",
            "SCREAMING_CASE,true",
            "--verbose,true",
            "-v,true",
            "config.yml,true",
            "`NullPointerException`,true",
            "NullPointerException,true",
            "RuntimeError,true",
            "build.gradle,true",
            "latency,false",
            "analysis,false",
            "queue,false",
            "students,false",
            "engineering,false"
    })
    void shouldClassifyProtectedTokens(String token, boolean expected) {
        assertThat(tokenClassifier.isProtected(token)).isEqualTo(expected);
    }
}
