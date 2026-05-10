package com.klubly.modules.activities.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.activities.dto.ActivityDTO;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.entity.Registration;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.TeamRepository;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ActivityServiceTest {

    @Mock private ActivityRepository activityRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private RegistrationRepository registrationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ActivityService activityService;

    private User adminUser;
    private User memberUser;
    private Activity testActivity;

    @BeforeEach
    void setUp() {
        Role adminRole = new Role(); adminRole.setName("ADMIN");
        Role memberRole = new Role(); memberRole.setName("MEMBER");

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole(adminRole);

        memberUser = new User();
        memberUser.setId(2L);
        memberUser.setUsername("member");
        memberUser.setRole(memberRole);
        memberUser.setAffiliations(new ArrayList<>());

        testActivity = new Activity();
        testActivity.setId(10L);
        testActivity.setName("Torneo Verano");
        testActivity.setStartDate(LocalDateTime.now().plusDays(1));
        testActivity.setEndDate(LocalDateTime.now().plusDays(2));
        testActivity.setTeams(new ArrayList<>());
    }

    @AfterEach
    void tearDown() {
        // Limpiamos el contexto de seguridad después de cada test
        SecurityContextHolder.clearContext();
    }

    private void mockAuthenticatedUser(String username) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        when(auth.getName()).thenReturn(username);
        when(auth.isAuthenticated()).thenReturn(true);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Debería fallar si la fecha de fin es anterior a la de inicio")
    void shouldThrowExceptionWhenDatesAreInvalid() {
        mockAuthenticatedUser("admin");
        when(userRepository.findByUsernameAndDeletedAtIsNull("admin")).thenReturn(Optional.of(adminUser));

        ActivityDTO dto = new ActivityDTO();
        dto.setStartDate(LocalDateTime.now().plusDays(2));
        dto.setEndDate(LocalDateTime.now().plusDays(1));

        assertThrows(BadRequestException.class, () -> activityService.createActivity(dto));
    }

    @Test
    @DisplayName("Un socio no debería ver una actividad de un equipo al que no pertenece")
    void memberShouldNotSeeActivityFromOtherTeam() {
        mockAuthenticatedUser("member");
        when(userRepository.findByUsernameAndDeletedAtIsNull("member")).thenReturn(Optional.of(memberUser));

        Team team5 = new Team(); team5.setId(5L);
        testActivity.setTeams(List.of(team5));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));

        assertThrows(UnauthorizedException.class, () -> activityService.getActivityById(10L));
    }

    @Test
    @DisplayName("Al borrar una actividad, se deben borrar lógicamente sus inscripciones")
    void shouldCascadeDeleteRegistrations() {
        mockAuthenticatedUser("admin");
        when(userRepository.findByUsernameAndDeletedAtIsNull("admin")).thenReturn(Optional.of(adminUser));

        Registration reg = new Registration();
        reg.setActive(true);
        testActivity.setRegistrations(List.of(reg));

        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));

        activityService.deleteActivity(10L);

        assertNotNull(testActivity.getDeletedAt());
        assertNotNull(reg.getDeletedAt());
        assertFalse(reg.getActive());
        verify(activityRepository).save(testActivity);
    }

    @Test
    @DisplayName("Debería detectar si el usuario actual ya está inscrito en la actividad")
    void shouldDetectIfUserIsAlreadyRegisteredInDto() {
        mockAuthenticatedUser("member");
        when(userRepository.findByUsernameAndDeletedAtIsNull("member")).thenReturn(Optional.of(memberUser));
        when(activityRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testActivity));
        
        when(registrationRepository.findByUserIdAndActivityIdAndDeletedAtIsNull(2L, 10L))
                .thenReturn(Optional.of(new Registration()));

        ActivityDTO result = activityService.getActivityById(10L);

        assertTrue(result.isUserRegistered());
    }
}