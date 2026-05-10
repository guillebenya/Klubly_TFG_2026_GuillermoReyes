package com.klubly.modules.identity.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.mockito.quality.Strictness;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    private User myCustomUser;

    @BeforeEach
    void setUp() {
        Role role = new Role();
        role.setName("ADMIN");

        myCustomUser = new User();
        myCustomUser.setUsername("test.user");
        myCustomUser.setPassword("hashedPassword123");
        myCustomUser.setActive(true);
        myCustomUser.setRole(role);
    }

    @Test
    @DisplayName("Debería retornar un UserDetails válido de Spring cuando el usuario existe")
    void shouldReturnUserDetailsWhenUserExists() {
        
        when(userRepository.findByUsernameAndDeletedAtIsNull("test.user"))
                .thenReturn(Optional.of(myCustomUser));

        
        UserDetails result = userDetailsService.loadUserByUsername("test.user");

        
        assertNotNull(result);
        assertEquals("test.user", result.getUsername());
        assertEquals("hashedPassword123", result.getPassword());
        assertTrue(result.isEnabled(), "El usuario debería estar habilitado (activo)");
        
        // Verificamos que se haya añadido el ROLE_
        assertTrue(result.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("Debería lanzar UsernameNotFoundException cuando el usuario no existe en BD")
    void shouldThrowExceptionWhenUserNotFound() {
        
        when(userRepository.findByUsernameAndDeletedAtIsNull("unknown.user"))
                .thenReturn(Optional.empty());

        
        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername("unknown.user");
        });
    }

    @Test
    @DisplayName("Debería mapear correctamente un usuario inactivo")
    void shouldMapInactiveUserCorrectly() {
        
        myCustomUser.setActive(false);
        when(userRepository.findByUsernameAndDeletedAtIsNull("test.user"))
                .thenReturn(Optional.of(myCustomUser));

    
        UserDetails result = userDetailsService.loadUserByUsername("test.user");

        
        assertFalse(result.isEnabled(), "El UserDetails debería reflejar que el usuario está inactivo");
    }
}