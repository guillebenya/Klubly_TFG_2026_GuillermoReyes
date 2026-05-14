package com.klubly.modules.activities.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.activities.dto.RegistrationDTO;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.entity.Registration;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
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
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RegistrationServiceTest {

    @Mock private RegistrationRepository registrationRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private RegistrationService registrationService;

    private User testUser;
    private Activity testActivity;
    private Role memberRole;

    @BeforeEach
    void setUp() {
        memberRole = new Role();
        memberRole.setName("MEMBER");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("user.test");
        testUser.setRole(memberRole);
        testUser.setAffiliations(new ArrayList<>());

        testActivity = new Activity();
        testActivity.setId(10L);
        testActivity.setName("Entrenamiento");
        testActivity.setCapacity(20);
        testActivity.setTeams(new ArrayList<>()); 
    }

    @AfterEach
    void tearDown() {
        // Limpiamos la seguridad después de cada test para evitar contaminación
        SecurityContextHolder.clearContext();
    }

    //Helper para simular un usuario autenticado en el contexto de Spring Security
    private void mockAuthenticatedUser(String username) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(auth.getName()).thenReturn(username);
        when(auth.isAuthenticated()).thenReturn(true);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("No debería permitir inscribirse si la actividad está llena")
    void shouldThrowExceptionWhenActivityIsFull() {
        mockAuthenticatedUser("user.test");
        
        when(userRepository.findByUsernameAndDeletedAtIsNull("user.test")).thenReturn(Optional.of(testUser));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));
        
        // Simulamos que el aforo ya está al máximo (20/20)
        when(registrationRepository.countByActivityIdAndDeletedAtIsNull(10L)).thenReturn(20L);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            registrationService.registerCurrentUser(10L)
        );

        assertTrue(ex.getMessage().contains("no quedan plazas disponibles"));
    }

    @Test
    @DisplayName("No debería permitir inscribirse si el usuario no pertenece al equipo requerido")
    void shouldThrowExceptionWhenUserNotInRequiredTeam() {
        mockAuthenticatedUser("user.test");

        // Actividad ligada a un equipo específico
        Team teamA = new Team(); teamA.setId(5L);
        testActivity.setTeams(Collections.singletonList(teamA));

        when(userRepository.findByUsernameAndDeletedAtIsNull("user.test")).thenReturn(Optional.of(testUser));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));

        // El usuario no tiene afiliaciones a ningún equipo
        assertThrows(UnauthorizedException.class, () -> registrationService.registerCurrentUser(10L));
    }

    @Test
    @DisplayName("Debería registrar correctamente si hay plazas y pertenece al equipo")
    void shouldRegisterSuccessfully() {
        mockAuthenticatedUser("user.test");

        when(userRepository.findByUsernameAndDeletedAtIsNull("user.test")).thenReturn(Optional.of(testUser));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));
        when(registrationRepository.countByActivityIdAndDeletedAtIsNull(10L)).thenReturn(5L); // 5 de 20
        when(registrationRepository.save(any(Registration.class))).thenAnswer(i -> i.getArguments()[0]);

        RegistrationDTO result = registrationService.registerCurrentUser(10L);

        assertNotNull(result);
        verify(registrationRepository).save(any(Registration.class));
    }

    @Test
    @DisplayName("Debería realizar borrado lógico al desapuntarse")
    void shouldUnregisterSuccessfully() {
        mockAuthenticatedUser("user.test");

        Registration existingReg = new Registration();
        existingReg.setUser(testUser);
        existingReg.setActivity(testActivity);
        existingReg.setActive(true);

        when(userRepository.findByUsernameAndDeletedAtIsNull("user.test")).thenReturn(Optional.of(testUser));
        when(registrationRepository.findByUserIdAndActivityIdAndDeletedAtIsNull(1L, 10L))
                .thenReturn(Optional.of(existingReg));

        registrationService.unregisterCurrentUser(10L);

        assertNotNull(existingReg.getDeletedAt());
        assertFalse(existingReg.getActive());
        verify(registrationRepository).save(existingReg);
    }

    @Test
    @DisplayName("Staff debería poder añadir a un usuario manualmente")
    void staffShouldAddUserManually() {
        mockAuthenticatedUser("staff.user");

        Role staffRole = new Role(); staffRole.setName("STAFF");
        User staffUser = new User(); staffUser.setUsername("staff.user"); staffUser.setRole(staffRole);

        when(userRepository.findByUsernameAndDeletedAtIsNull("staff.user")).thenReturn(Optional.of(staffUser));
        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testUser));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(i -> i.getArguments()[0]);

        RegistrationDTO result = registrationService.addRegistrationManual(10L, 1L);

        assertNotNull(result);
        verify(registrationRepository).save(any(Registration.class));
    }
}