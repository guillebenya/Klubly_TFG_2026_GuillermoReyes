package com.klubly.modules.identity.service;

import com.klubly.modules.identity.dto.TeamDTO;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.repository.AffiliationRepository;
import com.klubly.modules.identity.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final AffiliationRepository affiliationRepository;
    private static final String TEAM_NOT_FOUND_MSG = "Equipo no encontrado";

    @Transactional(readOnly = true)
    public List<TeamDTO> getAllActiveTeams() {
        return teamRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException(TEAM_NOT_FOUND_MSG));
        return convertToDTO(team);
    }

    @Transactional
    public TeamDTO createTeam(TeamDTO teamDTO) {
        Team team = new Team();
        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());
        team.setActive(true);
        
        Team savedTeam = teamRepository.save(team);
        return convertToDTO(savedTeam);
    }

    @Transactional
    public TeamDTO updateTeam(Long id, TeamDTO teamDTO) {
        Team team = teamRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException(TEAM_NOT_FOUND_MSG));

        team.setName(teamDTO.getName());
        team.setDescription(teamDTO.getDescription());
        if (teamDTO.getActive() != null) {
            team.setActive(teamDTO.getActive());
        }

        Team updatedTeam = teamRepository.save(team);
        return convertToDTO(updatedTeam);
    }

    @Transactional
    public void deleteTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(TEAM_NOT_FOUND_MSG));
        
        // Antes de marcar el equipo como eliminado, eliminamos las afiliaciones relacionadas
        affiliationRepository.deleteByTeamId(id); // Eliminar afiliaciones relacionadas al equipo
        team.setDeletedAt(LocalDateTime.now());
        team.setActive(false);
        teamRepository.save(team);
    }

    // MÉTODOS DE CONVERSIÓN (Mapeo manual)
    private TeamDTO convertToDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setActive(team.getActive());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        dto.setDeletedAt(team.getDeletedAt());
        if (team.getAffiliations() != null) {
            dto.setMemberCount(team.getAffiliations().size());
        } else {
            dto.setMemberCount(0);
        }
        return dto;
    }
}