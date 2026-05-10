package com.klubly.modules.identity.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.dto.RoleDTO;
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
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RoleServiceTest {

    @Mock private RoleRepository roleRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private RoleService roleService;

    private Role customRole;

    @BeforeEach
    void setUp() {
        customRole = new Role();
        customRole.setId(10L);
        customRole.setName("EDITOR");
        customRole.setDescription("Permite editar contenido");
        customRole.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos la seguridad para evitar efectos secundarios en otros tests
        SecurityContextHolder.clearContext();
    }

    /**
     * Helper para simular el rol en el contexto de seguridad
     */
    private void mockAuthenticatedRole(String role) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        doReturn(Collections.singletonList(new SimpleGrantedAuthority(role)))
            .when(auth).getAuthorities();
        when(auth.isAuthenticated()).thenReturn(true);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Debería retornar un RoleDTO con el conteo de usuarios correcto")
    void shouldReturnRoleDtoWithUserCount() {
        when(roleRepository.findById(10L)).thenReturn(Optional.of(customRole));
        when(userRepository.countByRoleAndDeletedAtIsNull(customRole)).thenReturn(5L);

        RoleDTO result = roleService.getRoleById(10L);

        assertNotNull(result);
        assertEquals(5, result.getUserCount());
        assertEquals("EDITOR", result.getName());
    }

    @Test
    @DisplayName("No debería permitir borrar un rol del sistema (ID <= 3)")
    void shouldNotDeleteSystemRoles() {
        mockAuthenticatedRole("ROLE_ADMIN");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            roleService.deleteRole(1L) // Intentando borrar ADMIN
        );

        assertTrue(ex.getMessage().contains("No se pueden eliminar roles de sistema"));
    }

    @Test
    @DisplayName("No debería permitir borrar un rol si tiene usuarios activos")
    void shouldNotDeleteRoleWithActiveUsers() {
        mockAuthenticatedRole("ROLE_ADMIN");

        // Simulamos que el rol tiene 1 usuario activo
        User activeUser = new User();
        activeUser.setDeletedAt(null);
        customRole.setUsers(List.of(activeUser));

        when(roleRepository.findById(10L)).thenReturn(Optional.of(customRole));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            roleService.deleteRole(10L)
        );

        assertTrue(ex.getMessage().contains("tiene usuarios asignados"));
    }

    @Test
    @DisplayName("Debería lanzar UnauthorizedException si un no-admin intenta crear un rol")
    void shouldThrowUnauthorizedWhenNotAdmin() {
        mockAuthenticatedRole("ROLE_MEMBER");

        RoleDTO dto = new RoleDTO();
        dto.setName("NUEVO_ROL");

        assertThrows(UnauthorizedException.class, () -> roleService.createRole(dto));
    }

    @Test
    @DisplayName("Debería realizar el borrado lógico si el rol es editable y no tiene usuarios")
    void shouldPerformSoftDeleteCorrectly() {
        mockAuthenticatedRole("ROLE_ADMIN");

        customRole.setUsers(Collections.emptyList()); // Sin usuarios
        when(roleRepository.findById(10L)).thenReturn(Optional.of(customRole));

        roleService.deleteRole(10L);

        assertNotNull(customRole.getDeletedAt());
        assertFalse(customRole.getActive());
        verify(roleRepository).save(customRole);
    }
}