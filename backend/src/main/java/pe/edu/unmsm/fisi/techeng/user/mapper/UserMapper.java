package pe.edu.unmsm.fisi.techeng.user.mapper;

import pe.edu.unmsm.fisi.techeng.user.dto.CreateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserResponse;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(CreateUserRequest request) {
        var user = new User();
        user.setCodigo(request.codigo());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(request.role() != null ? request.role() : UserRole.STUDENT);
        user.setFaculty(request.faculty());
        user.setEnglishLevel(request.englishLevel());
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getCodigo(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getFaculty(),
                user.getEnglishLevel(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
