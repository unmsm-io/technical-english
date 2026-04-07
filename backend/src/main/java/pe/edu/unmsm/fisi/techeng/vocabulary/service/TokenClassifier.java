package pe.edu.unmsm.fisi.techeng.vocabulary.service;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class TokenClassifier {

    private static final Pattern CAMEL_CASE = Pattern.compile("^[a-z]+(?:[A-Z][a-z0-9]+)+$");
    private static final Pattern SNAKE_CASE = Pattern.compile("^[a-z]+(?:_[a-z0-9]+)+$");
    private static final Pattern SCREAMING_CASE = Pattern.compile("^[A-Z]+(?:_[A-Z0-9]+)+$");
    private static final Pattern CLI_LONG_FLAG = Pattern.compile("^--[a-zA-Z][a-zA-Z0-9-]*$");
    private static final Pattern CLI_SHORT_FLAG = Pattern.compile("^-[a-zA-Z]$");
    private static final Pattern FILE_EXTENSION = Pattern.compile("^[a-zA-Z0-9_-]+\\.[a-z0-9]{1,6}$");
    private static final Pattern BACKTICK_QUOTED = Pattern.compile("^`[^`]+`$");
    private static final Pattern EXCEPTION_OR_ERROR = Pattern.compile("^[A-Za-z][A-Za-z0-9]*(Exception|Error)$");

    public boolean isProtected(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        return BACKTICK_QUOTED.matcher(token).matches()
                || CLI_LONG_FLAG.matcher(token).matches()
                || CLI_SHORT_FLAG.matcher(token).matches()
                || CAMEL_CASE.matcher(token).matches()
                || SNAKE_CASE.matcher(token).matches()
                || SCREAMING_CASE.matcher(token).matches()
                || FILE_EXTENSION.matcher(token).matches()
                || EXCEPTION_OR_ERROR.matcher(token).matches();
    }
}
