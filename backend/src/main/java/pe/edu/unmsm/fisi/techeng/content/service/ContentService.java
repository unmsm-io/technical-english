package pe.edu.unmsm.fisi.techeng.content.service;

import pe.edu.unmsm.fisi.techeng.content.dto.*;
import pe.edu.unmsm.fisi.techeng.content.entity.Module;
import pe.edu.unmsm.fisi.techeng.content.mapper.ContentMapper;
import pe.edu.unmsm.fisi.techeng.content.repository.LessonRepository;
import pe.edu.unmsm.fisi.techeng.content.repository.ModuleRepository;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {

    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final ContentMapper contentMapper;

    public ModuleResponse createModule(CreateModuleRequest request) {
        var module = contentMapper.toEntity(request);
        return contentMapper.toResponse(moduleRepository.save(module));
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> listModules() {
        return moduleRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream().map(contentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> listModulesByLevel(String level) {
        return moduleRepository.findByLevelAndActiveTrueOrderByDisplayOrderAsc(level)
                .stream().map(contentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ModuleResponse getModule(Long id) {
        var module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + id));
        return contentMapper.toResponse(module);
    }

    public LessonResponse createLesson(CreateLessonRequest request) {
        Module module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + request.moduleId()));
        var lesson = contentMapper.toEntity(request, module);
        return contentMapper.toResponse(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> listLessons(Long moduleId) {
        return lessonRepository.findByModuleIdAndActiveTrueOrderByDisplayOrderAsc(moduleId)
                .stream().map(contentMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LessonResponse getLesson(Long id) {
        var lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + id));
        return contentMapper.toResponse(lesson);
    }
}
