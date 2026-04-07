package pe.edu.unmsm.fisi.techeng.user.repository;

import pe.edu.unmsm.fisi.techeng.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByCodigo(String codigo);

    boolean existsByEmail(String email);

    boolean existsByCodigo(String codigo);

    @Query("""
            SELECT u FROM User u
            WHERE u.active = true
            AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(u.codigo) LIKE LOWER(CONCAT('%', :query, '%'))
                 OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<User> search(@Param("query") String query, Pageable pageable);

    Page<User> findByActiveTrue(Pageable pageable);

    long countByActiveTrue();

    long countByDiagnosticCompletedTrue();

    @Query("select coalesce(avg(u.vocabularySize), 0) from User u where u.vocabularySize is not null")
    Double averageVocabularySize();
}
