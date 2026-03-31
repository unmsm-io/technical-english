package pe.edu.unmsm.fisi.techeng.llm.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import pe.edu.unmsm.fisi.techeng.content.entity.Lesson;
import pe.edu.unmsm.fisi.techeng.content.repository.LessonRepository;
import pe.edu.unmsm.fisi.techeng.llm.dto.GenerateExercisesRequest;
import pe.edu.unmsm.fisi.techeng.llm.dto.GeneratedExercise;
import pe.edu.unmsm.fisi.techeng.practice.entity.Exercise;
import pe.edu.unmsm.fisi.techeng.practice.repository.ExerciseRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LlmService {

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;
    private final ObjectMapper objectMapper;

    @Value("${llm.api-key:}")
    private String apiKey;

    @Value("${llm.model:gpt-4o-mini}")
    private String model;

    @Value("${llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public List<GeneratedExercise> generateExercises(GenerateExercisesRequest request) {
        Lesson lesson = lessonRepository.findById(request.lessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + request.lessonId()));

        if (apiKey == null || apiKey.isBlank()) {
            throw new BusinessRuleException("LLM API key is not configured. Set llm.api-key in application.yml");
        }

        String prompt = buildPrompt(lesson, request);

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + apiKey)
                    .build();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are a Technical English teacher creating exercises for engineering students. Always respond with valid JSON array only, no markdown."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.7
            );

            String response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            String content = objectMapper.readTree(response)
                    .path("choices").get(0)
                    .path("message").path("content").asText();

            String json = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

            List<GeneratedExercise> exercises = objectMapper.readValue(
                    json, new TypeReference<>() {});

            for (GeneratedExercise gen : exercises) {
                var exercise = new Exercise();
                exercise.setLesson(lesson);
                exercise.setQuestion(gen.question());
                exercise.setType(gen.type() != null ? gen.type() : request.type());
                exercise.setOptions(gen.options());
                exercise.setCorrectAnswer(gen.correctAnswer());
                exercise.setExplanation(gen.explanation());
                exercise.setDifficulty(gen.difficulty() != null ? gen.difficulty() : request.difficulty());
                exercise.setLlmGenerated(true);
                exerciseRepository.save(exercise);
            }

            log.info("Generated {} exercises for lesson {}", exercises.size(), lesson.getId());
            return exercises;

        } catch (BusinessRuleException e) {
            throw e;
        } catch (Exception e) {
            log.error("LLM generation failed", e);
            throw new BusinessRuleException("Failed to generate exercises: " + e.getMessage());
        }
    }

    private String buildPrompt(Lesson lesson, GenerateExercisesRequest request) {
        return """
                Generate %d %s exercises about the following Technical English lesson.

                Lesson title: %s
                Lesson content: %s
                Difficulty: %s
                Exercise type: %s

                Return a JSON array where each element has:
                - "question": the exercise question
                - "type": "%s"
                - "options": comma-separated options (for MULTIPLE_CHOICE) or null
                - "correctAnswer": the correct answer
                - "explanation": brief explanation of why this is correct
                - "difficulty": "%s"

                Make exercises relevant to computing, engineering, and science contexts.
                """.formatted(
                request.count(),
                request.type().name().toLowerCase().replace("_", " "),
                lesson.getTitle(),
                lesson.getContent() != null ? lesson.getContent() : lesson.getTitle(),
                request.difficulty().name(),
                request.type().name(),
                request.type().name(),
                request.difficulty().name()
        );
    }
}
