package com.klubly.modules.activities.service;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.activities.dto.RegistrationDTO;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.entity.Registration;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private static final String ACTIVITY_NOT_FOUND_MSG = "Actividad no encontrada";

    // CONSULTAS

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getRegistrationsByActivity(Long activityId) {
        checkStaffOrAdminRole();
        
        // Validar que la actividad existe
        activityRepository.findByIdAndDeletedAtIsNull(activityId)
                .orElseThrow(() -> new ResourceNotFoundException(ACTIVITY_NOT_FOUND_MSG));

        return registrationRepository.findByActivityIdAndDeletedAtIsNull(activityId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // ACCIÓN PARA MEMBER (Apuntarse/Desapuntarse)

    @Transactional
    public RegistrationDTO registerCurrentUser(Long activityId) {
        User user = getCurrentUser();
        Activity activity = activityRepository.findByIdAndDeletedAtIsNull(activityId)
                .orElseThrow(() -> new ResourceNotFoundException(ACTIVITY_NOT_FOUND_MSG));

        // Validar duplicados (Si ya está apuntado)
        if (registrationRepository.findByUserIdAndActivityIdAndDeletedAtIsNull(user.getId(), activityId).isPresent()) {
            throw new BadRequestException("Ya estás inscrito en esta actividad.");
        }

        // Validar pertenencia al equipo (Si no es actividad global)
        validateTeamMembership(user, activity);

        // Validar aforo (Plazas disponibles)
        validateCapacity(activity);

        Registration reg = new Registration();
        reg.setUser(user);
        reg.setActivity(activity);
        reg.setRegistrationDate(LocalDateTime.now());
        reg.setActive(true);

        return convertToDTO(registrationRepository.save(reg));
    }

    @Transactional
    public void unregisterCurrentUser(Long activityId) {
        User user = getCurrentUser();
        Registration reg = registrationRepository.findByUserIdAndActivityIdAndDeletedAtIsNull(user.getId(), activityId)
                .orElseThrow(() -> new BadRequestException("No estás inscrito en esta actividad."));

        reg.setDeletedAt(LocalDateTime.now());
        reg.setActive(false);
        registrationRepository.save(reg);
    }

    //ACCIÓN PARA ADMIN/STAFF

    @Transactional
    public RegistrationDTO addRegistrationManual(Long activityId, Long userId) {
        checkStaffOrAdminRole();

        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Activity activity = activityRepository.findByIdAndDeletedAtIsNull(activityId)
                .orElseThrow(() -> new ResourceNotFoundException(ACTIVITY_NOT_FOUND_MSG));

        if (registrationRepository.findByUserIdAndActivityIdAndDeletedAtIsNull(userId, activityId).isPresent()) {
            throw new BadRequestException("El usuario ya está inscrito.");
        }
        
        validateCapacity(activity);

        Registration reg = new Registration();
        reg.setUser(user);
        reg.setActivity(activity);
        reg.setRegistrationDate(LocalDateTime.now());
        reg.setActive(true);

        return convertToDTO(registrationRepository.save(reg));
    }

    @Transactional
    public void removeRegistrationManual(Long registrationId) {
        checkStaffOrAdminRole();
        Registration reg = registrationRepository.findByIdAndDeletedAtIsNull(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

        reg.setDeletedAt(LocalDateTime.now());
        reg.setActive(false);
        registrationRepository.save(reg);
    }

    //MÉTODOS AUXILIARES

    private void validateCapacity(Activity activity) {
        long currentCount = registrationRepository.countByActivityIdAndDeletedAtIsNull(activity.getId());
        if (currentCount >= activity.getCapacity()) {
            throw new BadRequestException("Lo sentimos, no quedan plazas disponibles.");
        }
    }

    private void validateTeamMembership(User user, Activity activity) {
    if (!activity.getTeams().isEmpty()) {
        List<Long> userTeamIds = user.getAffiliations().stream()
                .map(aff -> aff.getTeam().getId())
                .toList();

        
        boolean isAuthorized = activity.getTeams().stream()
                .anyMatch(team -> userTeamIds.contains(team.getId()));

        if (!isAuthorized) {
            throw new UnauthorizedException("No perteneces al equipo de esta actividad.");
        }
    }
}

    private RegistrationDTO convertToDTO(Registration reg) {
        RegistrationDTO dto = new RegistrationDTO();
        dto.setId(reg.getId());
        dto.setUserId(reg.getUser().getId());
        dto.setActivityId(reg.getActivity().getId());
        dto.setRegistrationDate(reg.getRegistrationDate());
        dto.setActive(reg.getActive());
        dto.setCreatedAt(reg.getCreatedAt());
        dto.setDeletedAt(reg.getDeletedAt());

        // Datos para las cards de gestión
        dto.setUserFullName(reg.getUser().getFirstName() + " " + reg.getUser().getLastName());
        dto.setUserEmail(reg.getUser().getEmail());
        dto.setUserPhone(reg.getUser().getPhone());
        
        // Buscamos el equipo y posición del usuario dentro del contexto de la actividad
        if (!reg.getActivity().getTeams().isEmpty()) {
            List<Long> activityTeamIds = reg.getActivity().getTeams().stream()
                    .map(Team::getId).toList();
            
            reg.getUser().getAffiliations().stream()
                .filter(aff -> activityTeamIds.contains(aff.getTeam().getId()))
                .findFirst()
                .ifPresent(aff -> {
                    dto.setTeamName(aff.getTeam().getName());
                    dto.setTeamPosition(aff.getTeamPosition());
                });
        }

        return dto;
    }

    private User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
        throw new UnauthorizedException("Usuario no autenticado");
    }
    return userRepository.findByUsernameAndDeletedAtIsNull(authentication.getName())
            .orElseThrow(() -> new UnauthorizedException("Usuario no autenticado"));
}

    private void checkStaffOrAdminRole() {
        String role = getCurrentUser().getRole().getName();
        if (!role.equals("ADMIN") && !role.equals("STAFF")) {
            throw new UnauthorizedException("No tienes permisos para gestionar inscripciones.");
        }
    }
}