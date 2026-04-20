package com.klubly.modules.identity.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.klubly.modules.identity.dto.AffiliationDTO;
import com.klubly.modules.identity.entity.Affiliation;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.TeamRepository;
import com.klubly.modules.identity.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AffiliationService {

    private final AffiliationRepository affiliationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private static final String AFFILIATION_NOT_FOUND_MSG = "Afiliación no encontrada";

    //Obtener todas las afiliaciones activas
    public List<AffiliationDTO> getAllActiveAffiliations() {
        return affiliationRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //Obtener afiliación por id
    public AffiliationDTO getAffiliationById(Long id) {
        Affiliation affiliation = affiliationRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(AFFILIATION_NOT_FOUND_MSG));
        return convertToDTO(affiliation);
    }

    //Obtener afiliaciones por usuario
    public List<AffiliationDTO> getAffiliationsByUserId(Long userId) {
        return affiliationRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //Obtener afiliaciones por equipo
    public List<AffiliationDTO> getAffiliationsByTeamId(Long teamId) {
        return affiliationRepository.findByTeamIdAndDeletedAtIsNull(teamId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    //Crear Afiliación
    @Transactional
    public AffiliationDTO createAffiliation(AffiliationDTO affiliationDTO) {
        // Validar que el usuario y el equipo existen
        var user = userRepository.findByIdAndDeletedAtIsNull(affiliationDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        var team = teamRepository.findByIdAndDeletedAtIsNull(affiliationDTO.getTeamId())
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        // Validar que la afiliación no exista ya
        if (affiliationRepository.existsByUserIdAndTeamIdAndDeletedAtIsNull(affiliationDTO.getUserId(), affiliationDTO.getTeamId())) {
            throw new RuntimeException("El usuario ya está afiliado a este equipo");
        }

        Affiliation affiliation = new Affiliation();
        affiliation.setUser(user);
        affiliation.setTeam(team);
        affiliation.setTeamPosition(affiliationDTO.getTeamPosition()); // Asignar la posición específica en el equipo
        Affiliation savedAffiliation = affiliationRepository.save(affiliation);
        return convertToDTO(savedAffiliation);
    }

    //Actualizar Afiliación (solo la posición en el equipo, no se puede cambiar usuario o equipo)
    @Transactional
    public AffiliationDTO updateAffiliation(Long id, AffiliationDTO affiliationDTO) {
        Affiliation affiliation = affiliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(AFFILIATION_NOT_FOUND_MSG));
        affiliation.setTeamPosition(affiliationDTO.getTeamPosition()); // Actualizar solo la posición específica en el equipo
        Affiliation updatedAffiliation = affiliationRepository.save(affiliation);
        return convertToDTO(updatedAffiliation);
    }

    //Eliminar Afiliación
    @Transactional
    public void deleteAffiliation(Long id) {
        Affiliation affiliation = affiliationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(AFFILIATION_NOT_FOUND_MSG));
        
        log.info("Desvinculando usuario '{}' del equipo '{}'", 
             affiliation.getUser().getUsername(), 
             affiliation.getTeam().getName());
        
        affiliation.setDeletedAt(java.time.LocalDateTime.now());
        affiliation.setActive(false);
        affiliationRepository.save(affiliation);
    }

    //MÉTODO PRIVADO DE CONVERSIÓN PARA MAPEO MANUAL
    private AffiliationDTO convertToDTO(Affiliation affiliation) {
        AffiliationDTO dto = new AffiliationDTO();
        dto.setId(affiliation.getId());
        dto.setUserId(affiliation.getUser().getId());
        dto.setTeamId(affiliation.getTeam().getId());
        dto.setTeamPosition(affiliation.getTeamPosition()); // Posición específica en el equipo
        dto.setUsername(affiliation.getUser().getUsername()); // Para mostrar el nombre de usuario sin necesidad de otra consulta
        dto.setTeamName(affiliation.getTeam().getName()); // Para mostrar el nombre del equipo sin necesidad de otra consulta
        dto.setClubPosition(affiliation.getUser().getClubPosition()); // Para mostrar la posición del usuario en el club sin necesidad de otra consulta
        return dto;
    }
}
