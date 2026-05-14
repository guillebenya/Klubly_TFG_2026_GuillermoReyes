package com.klubly.modules.identity.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.dto.ChangePasswordRequest;
import com.klubly.modules.identity.dto.UserDTO;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserService userService;

    private User adminUser;
    private User memberUser;
    private Role adminRole;
    private Role memberRole;

    @BeforeEach
    void setUp() {
        adminRole = new Role();
        adminRole.setName("ADMIN");
        adminRole.setId(1L);

        memberRole = new Role();
        memberRole.setName("MEMBER");
        memberRole.setId(3L);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin.test");
        adminUser.setEmail("admin@test.com");
        adminUser.setRole(adminRole);

        memberUser = new User();
        memberUser.setId(2L);
        memberUser.setUsername("member.test");
        memberUser.setEmail("member@test.com");
        memberUser.setRole(memberRole);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    //Helper para simular un usuario autenticado con su rol
    private void mockAuthenticatedUser(String username, String role) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(auth.getName()).thenReturn(username);
        when(auth.isAuthenticated()).thenReturn(true);
        doReturn(Collections.singletonList(new SimpleGrantedAuthority(role)))
            .when(auth).getAuthorities();
            
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Debería obtener un usuario por ID correctamente si existe")
    void shouldReturnUserDtoWhenIdExists() {
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(adminUser));

        UserDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("admin.test", result.getUsername());
        verify(userRepository).findByIdAndDeletedAtIsNull(1L);
    }

    @Test
    @DisplayName("Debería fallar al crear un usuario si el username ya está en uso")
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        mockAuthenticatedUser("admin.test", "ROLE_ADMIN");
        
        UserDTO dto = new UserDTO();
        dto.setUsername("existing.user");
        dto.setPassword("password123");

        when(userRepository.existsByUsernameAndDeletedAtIsNull("existing.user")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.createUser(dto));
    }

    @Test
    @DisplayName("Un ADMIN debería poder aprobar a un usuario pendiente")
    void adminShouldApprovePendingUser() {
        mockAuthenticatedUser("admin.test", "ROLE_ADMIN");

        User pendingUser = new User();
        pendingUser.setId(10L);
        pendingUser.setUsername("usuario.test");
        pendingUser.setEmail("pendingUser@klubly.com");
        pendingUser.setIsPending(true);
        pendingUser.setActive(false);
        pendingUser.setRole(memberRole);

        UserDTO updateDto = new UserDTO();
        updateDto.setIsPending(false); 
        updateDto.setActive(true);
        updateDto.setRoleId(memberRole.getId()); 

        // El servicio necesita encontrar al admin autenticado y al usuario a editar
        when(userRepository.findByUsernameAndDeletedAtIsNull("admin.test")).thenReturn(Optional.of(adminUser));
        when(userRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        UserDTO result = userService.updateUser(10L, updateDto);

        assertFalse(result.getIsPending());
        assertTrue(result.getActive());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Un usuario no debería poder editar el perfil de otra persona")
    void userShouldNotEditOtherUserProfile() {
        mockAuthenticatedUser("member.test", "ROLE_MEMBER");
        
        UserDTO updateDto = new UserDTO();
        updateDto.setFirstName("Intento de cambio");

        // El actor es member.test (ID 2), intenta editar ID 1 (Admin)
        when(userRepository.findByUsernameAndDeletedAtIsNull("member.test")).thenReturn(Optional.of(memberUser));

        assertThrows(UnauthorizedException.class, () -> userService.updateUser(1L, updateDto));
    }

    @Test
    @DisplayName("El Administrador no debería poder borrarse a sí mismo por seguridad")
    void adminShouldNotDeleteThemself() {
        mockAuthenticatedRole("ROLE_ADMIN");
        mockAuthenticatedUser("admin.test", "ROLE_ADMIN");
        
        when(userRepository.findByUsernameAndDeletedAtIsNull("admin.test")).thenReturn(Optional.of(adminUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> userService.deleteUser(1L));
        assertTrue(ex.getMessage().contains("no puedes eliminar tu propio usuario"));
    }

    // Método para casos donde solo importa el rol
    private void mockAuthenticatedRole(String role) {
        mockAuthenticatedUser("anonymous", role);
    }

    @Test
    @DisplayName("Debería cambiar la contraseña correctamente")
    void shouldChangePasswordSuccessfully() {
        //Simular usuario autenticado
        mockAuthenticatedUser("admin.test", "ROLE_ADMIN");
        
        //Mockear que el usuario existe en la DB y tiene una clave vieja
        adminUser.setPassword("encodedOldPassword");
        when(userRepository.findByUsernameAndDeletedAtIsNull("admin.test")).thenReturn(Optional.of(adminUser));
        
        //Simular que la clave vieja coincide y encodear la nueva
        when(passwordEncoder.matches("oldPassword123", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");

        //Crear el request (Record)
        ChangePasswordRequest request = new ChangePasswordRequest(
            "oldPassword123", 
            "newPassword123", 
            "newPassword123"
        );

        //Ejecutar
        assertDoesNotThrow(() -> userService.changePassword(request));
        
        //Verificar
        assertEquals("encodedNewPassword", adminUser.getPassword());
        verify(userRepository).save(adminUser);
    }
}