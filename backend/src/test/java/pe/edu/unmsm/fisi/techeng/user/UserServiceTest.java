package pe.edu.unmsm.fisi.techeng.user;

import pe.edu.unmsm.fisi.techeng.shared.exception.BusinessRuleException;
import pe.edu.unmsm.fisi.techeng.shared.exception.ResourceNotFoundException;
import pe.edu.unmsm.fisi.techeng.user.dto.CreateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UpdateUserRequest;
import pe.edu.unmsm.fisi.techeng.user.dto.UserResponse;
import pe.edu.unmsm.fisi.techeng.user.entity.User;
import pe.edu.unmsm.fisi.techeng.user.entity.UserRole;
import pe.edu.unmsm.fisi.techeng.user.mapper.UserMapper;
import pe.edu.unmsm.fisi.techeng.user.repository.UserRepository;
import pe.edu.unmsm.fisi.techeng.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Spy
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private CreateUserRequest createRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        createRequest = new CreateUserRequest(
                "20200001",
                "Juan",
                "Perez",
                "juan.perez@unmsm.edu.pe",
                "password123",
                UserRole.STUDENT,
                "FISI",
                "A1"
        );

        savedUser = new User();
        savedUser.setId(1L);
        savedUser.setCodigo("20200001");
        savedUser.setFirstName("Juan");
        savedUser.setLastName("Perez");
        savedUser.setEmail("juan.perez@unmsm.edu.pe");
        savedUser.setPassword("password123");
        savedUser.setRole(UserRole.STUDENT);
        savedUser.setFaculty("FISI");
        savedUser.setEnglishLevel("A1");
        savedUser.setActive(true);
    }

    @Test
    void create_shouldReturnUserResponse() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByCodigo(any())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.create(createRequest);

        assertThat(response.codigo()).isEqualTo("20200001");
        assertThat(response.firstName()).isEqualTo("Juan");
        assertThat(response.email()).isEqualTo("juan.perez@unmsm.edu.pe");
        assertThat(response.role()).isEqualTo(UserRole.STUDENT);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void create_shouldThrowWhenEmailExists() {
        when(userRepository.existsByEmail("juan.perez@unmsm.edu.pe")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(createRequest))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void create_shouldThrowWhenCodigoExists() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByCodigo("20200001")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(createRequest))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Código already registered");
    }

    @Test
    void getById_shouldReturnUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));

        UserResponse response = userService.getById(1L);

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.codigo()).isEqualTo("20200001");
    }

    @Test
    void getById_shouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_shouldUpdateFields() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        var updateRequest = new UpdateUserRequest(
                "Juan Carlos", null, null, null, "FISI", "B1"
        );
        UserResponse response = userService.update(1L, updateRequest);

        assertThat(savedUser.getFirstName()).isEqualTo("Juan Carlos");
        assertThat(savedUser.getEnglishLevel()).isEqualTo("B1");
    }

    @Test
    void delete_shouldSoftDelete() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        userService.delete(1L);

        assertThat(savedUser.getActive()).isFalse();
        verify(userRepository).save(savedUser);
    }
}
