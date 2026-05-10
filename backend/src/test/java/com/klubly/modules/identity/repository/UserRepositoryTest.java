package com.klubly.modules.identity.repository;

import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@EntityScan(basePackages = "com.klubly")
@EnableJpaRepositories(basePackages = "com.klubly")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Role memberRole;

    @BeforeEach
    void setUp() {
        memberRole = new Role();
        memberRole.setName("MEMBER");
        memberRole.setCreatedAt(LocalDateTime.now());
        memberRole.setUpdatedAt(LocalDateTime.now());
        memberRole.setActive(true);
        memberRole = roleRepository.save(memberRole);
    }

    private User createValidUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("hashed_password_123");
        user.setFirstName("Guillermo");
        user.setLastName("Reyes");
        user.setRole(memberRole);
        user.setIsPending(false); 
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);
        
        return user;
    }

    @Test
    @DisplayName("Debe encontrar un usuario activo por su username")
    void shouldFindActiveUserByUsername() {
        User user = createValidUser("guillermo", "guille@test.com");
        userRepository.save(user);

        Optional<User> found = userRepository.findByUsernameAndDeletedAtIsNull("guillermo");

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("guillermo");
    }

    @Test
    @DisplayName("NO debe encontrar un usuario si está marcado como borrado (deletedAt != null)")
    void shouldNotFindDeletedUser() {
        User user = createValidUser("borrado", "borrado@test.com");
        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);

        Optional<User> found = userRepository.findByUsernameAndDeletedAtIsNull("borrado");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Debe retornar vacío si el usuario no existe")
    void shouldReturnEmptyWhenUserNotFound() {
        Optional<User> found = userRepository.findByUsernameAndDeletedAtIsNull("inexistente");
        assertThat(found).isEmpty();
    }
}