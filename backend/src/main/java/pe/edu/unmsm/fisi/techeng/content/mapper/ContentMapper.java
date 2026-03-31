package pe.edu.unmsm.fisi.techeng.content.mapper;

import pe.edu.unmsm.fisi.techeng.content.dto.*;
import pe.edu.unmsm.fisi.techeng.content.entity.*;
import pe.edu.unmsm.fisi.techeng.content.entity.Module;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class ContentMapper {

    public Module toEntity(CreateModuleRequest request) {
        var module = new Module();
        module.setTitle(request.title());
        module.setDescription(request.description());
        module.setDisplayOrder(request.displayOrder());
        module.setLevel(request.level());
        return module;
    }

    public ModuleResponse toResponse(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getTitle(),
                module.getDescription(),
                module.getDisplayOrder(),
                module.getLevel(),
                module.getActive(),
                module.getLessons() != null ? module.getLessons().size() : 0,
                module.getCreatedAt()
        );
    }

    public Lesson toEntity(CreateLessonRequest request, Module module) {
        var lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setDisplayOrder(request.displayOrder());
        lesson.setEstimatedMinutes(request.estimatedMinutes() != null ? request.estimatedMinutes() : 30);
        lesson.setType(request.type() != null ? request.type() : LessonType.THEORY);
        return lesson;
    }

    public LessonResponse toResponse(Lesson lesson) {
        List<ResourceResponse> resources = lesson.getResources() != null
                ? lesson.getResources().stream().map(this::toResponse).toList()
                : List.of();
        return new LessonResponse(
                lesson.getId(),
                lesson.getModule().getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getDisplayOrder(),
                lesson.getEstimatedMinutes(),
                lesson.getType(),
                lesson.getActive(),
                resources,
                lesson.getCreatedAt()
        );
    }

    public ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getUrl(),
                resource.getType(),
                resource.getDescription()
        );
    }
}
