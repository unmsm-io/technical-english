package pe.edu.unmsm.fisi.techeng.user.service;

import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.dto.CreateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UpdateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserProfileUpdateRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserResponse;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.mapper.UserMapper;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Email already registered");
        }
        if (userRepository.existsByCodigo(request.codigo())) {
            throw new BusinessRuleException("Código already registered");
        }

        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findByActiveTrue(pageable)
                .map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> search(String query, Pageable pageable) {
        return userRepository.search(query, pageable)
                .map(userMapper::toResponse);
    }

    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.firstName() != null) user.setFirstName(request.firstName());
        if (request.lastName() != null) user.setLastName(request.lastName());
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new BusinessRuleException("Email already registered");
            }
            user.setEmail(request.email());
        }
        if (request.role() != null) user.setRole(request.role());
        if (request.faculty() != null) user.setFaculty(request.faculty());
        if (request.englishLevel() != null) user.setEnglishLevel(request.englishLevel());
        if (request.targetSkills() != null) user.setTargetSkills(userMapper.joinSkills(request.targetSkills()));
        if (request.vocabularySize() != null) user.setVocabularySize(request.vocabularySize());
        if (request.diagnosticCompleted() != null) user.setDiagnosticCompleted(request.diagnosticCompleted());
        if (request.diagnosticCompletedAt() != null) user.setDiagnosticCompletedAt(request.diagnosticCompletedAt());

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    public UserResponse patchProfile(Long id, UserProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.targetSkills() != null) user.setTargetSkills(userMapper.joinSkills(request.targetSkills()));
        if (request.vocabularySize() != null) user.setVocabularySize(request.vocabularySize());
        if (request.diagnosticCompleted() != null) user.setDiagnosticCompleted(request.diagnosticCompleted());
        if (request.diagnosticCompletedAt() != null) user.setDiagnosticCompletedAt(request.diagnosticCompletedAt());

        return userMapper.toResponse(userRepository.save(user));
    }

    public User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }
}
