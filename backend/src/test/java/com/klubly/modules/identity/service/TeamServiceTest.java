package com.klubly.modules.identity.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.dto.TeamDTO;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.TeamRepository;
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
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private AffiliationRepository affiliationRepository;

    @InjectMocks
    private TeamService teamService;

    private Team testTeam;

    @BeforeEach
    void setUp() {
        testTeam = new Team();
        testTeam.setId(1L);
        testTeam.setName("Equipo Senior A");
        testTeam.setDescription("Equipo principal de competición");
        testTeam.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos el contexto para asegurar independencia entre tests
        SecurityContextHolder.clearContext();
    }

    /**
     * Helper para inyectar un rol en el contexto de seguridad de Spring
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
    @DisplayName("Debería retornar un equipo por ID con el conteo de miembros correcto")
    void shouldReturnTeamWithMemberCount() {
        Affiliation aff1 = new Affiliation();
        Affiliation aff2 = new Affiliation();
        testTeam.setAffiliations(List.of(aff1, aff2));

        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));

        TeamDTO result = teamService.getTeamById(1L);

        assertNotNull(result);
        assertEquals(2, result.getMemberCount());
        assertEquals("Equipo Senior A", result.getName());
    }

    @Test
    @DisplayName("Debería lanzar excepción si el equipo buscado no existe")
    void shouldThrowExceptionWhenTeamNotFound() {
        when(teamRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> teamService.getTeamById(1L));
    }

    @Test
    @DisplayName("Un ADMIN debería poder crear un nuevo equipo")
    void adminShouldCreateTeam() {
        mockAuthenticatedRole("ROLE_ADMIN");

        TeamDTO inputDto = new TeamDTO();
        inputDto.setName("Nuevo Equipo");
        
        when(teamRepository.save(any(Team.class))).thenReturn(testTeam);

        TeamDTO result = teamService.createTeam(inputDto);

        assertNotNull(result);
        verify(teamRepository).save(any(Team.class));
    }

    @Test
    @DisplayName("Debería fallar si un socio intenta ver equipos eliminados")
    void shouldFailWhenNonAdminViewsDeletedTeams() {
        mockAuthenticatedRole("ROLE_MEMBER");

        assertThrows(UnauthorizedException.class, () -> teamService.getAllDeletedTeams());
    }

    @Test
    @DisplayName("Al eliminar un equipo, debería limpiar sus afiliaciones y aplicar borrado lógico")
    void shouldDeleteTeamAndItsAffiliations() {
        mockAuthenticatedRole("ROLE_ADMIN");

        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));

        teamService.deleteTeam(1L);

        // Verificamos borrado de afiliaciones vinculadas
        verify(affiliationRepository).deleteByTeamId(1L);
        
        // Verificamos estado del equipo (Soft Delete)
        assertNotNull(testTeam.getDeletedAt());
        assertFalse(testTeam.getActive());
        verify(teamRepository).save(testTeam);
    }
}