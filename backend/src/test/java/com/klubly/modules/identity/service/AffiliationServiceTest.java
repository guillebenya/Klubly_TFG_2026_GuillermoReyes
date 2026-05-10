package com.klubly.modules.identity.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.dto.AffiliationDTO;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.AffiliationRepository;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AffiliationServiceTest {

    @Mock private AffiliationRepository affiliationRepository;
    @Mock private UserRepository userRepository;
    @Mock private TeamRepository teamRepository;

    @InjectMocks private AffiliationService affiliationService;

    private User testUser;
    private Team testTeam;
    private Affiliation testAffiliation;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("juan.perez");
        testUser.setClubPosition("Socio");

        testTeam = new Team();
        testTeam.setId(5L);
        testTeam.setName("Senior Masculino");

        testAffiliation = new Affiliation();
        testAffiliation.setId(100L);
        testAffiliation.setUser(testUser);
        testAffiliation.setTeam(testTeam);
        testAffiliation.setTeamPosition("Delantero");
        testAffiliation.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos la seguridad para que el siguiente test empiece de cero
        SecurityContextHolder.clearContext();
    }

    // Helper para simular el rol en el contexto de seguridad
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
    @DisplayName("Debería crear una afiliación correctamente cuando los datos son válidos")
    void shouldCreateAffiliationSuccessfully() {
        mockAuthenticatedRole("ROLE_ADMIN");

        AffiliationDTO dto = new AffiliationDTO();
        dto.setUserId(1L);
        dto.setTeamId(5L);
        dto.setTeamPosition("Base");

        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByIdAndDeletedAtIsNull(5L)).thenReturn(Optional.of(testTeam));
        when(affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(1L, 5L)).thenReturn(false);
        when(affiliationRepository.save(any(Affiliation.class))).thenReturn(testAffiliation);

        AffiliationDTO result = affiliationService.createAffiliation(dto);

        assertNotNull(result);
        assertEquals("juan.perez", result.getUsername());
        verify(affiliationRepository).save(any(Affiliation.class));
    }

    @Test
    @DisplayName("No debería permitir duplicar una afiliación existente")
    void shouldThrowExceptionWhenAffiliationAlreadyExists() {
        mockAuthenticatedRole("ROLE_ADMIN");

        AffiliationDTO dto = new AffiliationDTO();
        dto.setUserId(1L);
        dto.setTeamId(5L);

        when(userRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testUser));
        when(teamRepository.findByIdAndDeletedAtIsNull(5L)).thenReturn(Optional.of(testTeam));
        when(affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(1L, 5L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> affiliationService.createAffiliation(dto));
    }

    @Test
    @DisplayName("Debería realizar un borrado lógico de la afiliación")
    void shouldPerformSoftDeleteOnAffiliation() {
        mockAuthenticatedRole("ROLE_ADMIN");

        when(affiliationRepository.findById(100L)).thenReturn(Optional.of(testAffiliation));

        affiliationService.deleteAffiliation(100L);

        assertNotNull(testAffiliation.getDeletedAt());
        assertFalse(testAffiliation.getActive());
        verify(affiliationRepository).save(testAffiliation);
    }

    @Test
    @DisplayName("Debería denegar el acceso si un STAFF intenta crear una afiliación")
    void shouldDenyAccessForStaffOnCreation() {
        mockAuthenticatedRole("ROLE_STAFF");

        AffiliationDTO dto = new AffiliationDTO();
        assertThrows(UnauthorizedException.class, () -> affiliationService.createAffiliation(dto));
    }

    @Test
    @DisplayName("Debería mapear correctamente los campos del usuario y equipo al DTO")
    void shouldMapUserAndTeamFieldsToDto() {
        when(affiliationRepository.findByIdAndDeletedAtIsNull(100L)).thenReturn(Optional.of(testAffiliation));

        AffiliationDTO result = affiliationService.getAffiliationById(100L);

        assertEquals("juan.perez", result.getUsername());
        assertEquals("Senior Masculino", result.getTeamName());
        assertEquals("Socio", result.getClubPosition());
    }
}