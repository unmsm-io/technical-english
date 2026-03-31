package pe.edu.unmsm.fisi.techeng.practice.service;

import pe.edu.unmsm.fisi.techeng.content.entity.Lesson;
import pe.edu.unmsm.fisi.techeng.content.repository.LessonRepository;
import pe.edu.unmsm.fisi.techeng.practice.dto.*;
import pe.edu.unmsm.fisi.techeng.practice.entity.*;
import pe.edu.unmsm.fisi.techeng.practice.repository.AttemptRepository;
import pe.edu.unmsm.fisi.techeng.practice.repository.ExerciseRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PracticeService {

    private final ExerciseRepository exerciseRepository;
    private final AttemptRepository attemptRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public ExerciseResponse createExercise(CreateExerciseRequest request) {
        Lesson lesson = null;
        if (request.lessonId() != null) {
            lesson = lessonRepository.findById(request.lessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + request.lessonId()));
        }

        var exercise = new Exercise();
        exercise.setLesson(lesson);
        exercise.setQuestion(request.question());
        exercise.setType(request.type());
        exercise.setOptions(request.options());
        exercise.setCorrectAnswer(request.correctAnswer());
        exercise.setExplanation(request.explanation());
        exercise.setDifficulty(request.difficulty() != null ? request.difficulty() : Difficulty.BEGINNER);

        var saved = exerciseRepository.save(exercise);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> listExercises(Long lessonId) {
        return exerciseRepository.findByLessonIdAndActiveTrue(lessonId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ExerciseResponse getExercise(Long id) {
        var exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found: " + id));
        return toResponse(exercise);
    }

    public AttemptResponse submitAnswer(SubmitAnswerRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));
        Exercise exercise = exerciseRepository.findById(request.exerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found: " + request.exerciseId()));

        boolean correct = exercise.getCorrectAnswer().trim().equalsIgnoreCase(request.answer().trim());

        var attempt = new Attempt();
        attempt.setUser(user);
        attempt.setExercise(exercise);
        attempt.setUserAnswer(request.answer());
        attempt.setCorrect(correct);
        attempt.setScore(correct ? 100.0 : 0.0);
        attempt.setFeedback(correct ? "Correct!" : "Incorrect. The correct answer is: " + exercise.getCorrectAnswer());
        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        var saved = attemptRepository.save(attempt);
        return toAttemptResponse(saved, exercise);
    }

    @Transactional(readOnly = true)
    public List<AttemptResponse> getUserAttempts(Long userId) {
        return attemptRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(a -> toAttemptResponse(a, a.getExercise())).toList();
    }

    private ExerciseResponse toResponse(Exercise e) {
        return new ExerciseResponse(
                e.getId(),
                e.getLesson() != null ? e.getLesson().getId() : null,
                e.getQuestion(),
                e.getType(),
                e.getOptions(),
                e.getDifficulty(),
                e.getLlmGenerated(),
                e.getCreatedAt()
        );
    }

    private AttemptResponse toAttemptResponse(Attempt a, Exercise e) {
        return new AttemptResponse(
                a.getId(),
                a.getUser().getId(),
                e.getId(),
                a.getUserAnswer(),
                e.getCorrectAnswer(),
                a.getCorrect(),
                a.getScore(),
                a.getFeedback(),
                e.getExplanation(),
                a.getCompletedAt()
        );
    }
}
