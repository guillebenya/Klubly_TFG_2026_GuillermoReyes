package com.klubly.modules.activities.service;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.activities.dto.ActivityDTO;
import com.klubly.modules.activities.entity.Activity;
import com.klubly.modules.activities.repository.ActivityRepository;
import com.klubly.modules.activities.repository.RegistrationRepository;
import com.klubly.modules.identity.entity.Team;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.TeamRepository;
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
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final TeamRepository teamRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    private static final String ACT_NOT_FOUND = "Actividad no encontrada";
    private static final String ADMIN_ROLE = "ADMIN";

   @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesForCurrentUser() {
        User user = getCurrentUser(); 
        String role = user.getRole().getName();

        if (role.equals(ADMIN_ROLE)) {
            return activityRepository.findByDeletedAtIsNullOrderByStartDateAsc()
                    .stream()
                    .map(a -> convertToDTO(a, user.getId())) 
                    .toList();
        }

        // STAFF y MEMBER solo ven actividades de sus equipos o globales
        List<Long> teamIds = user.getAffiliations().stream()
                .map(aff -> aff.getTeam().getId())
                .toList();

        return activityRepository.findByTeamIdsInOrGlobal(teamIds)
                .stream()
                .map(a -> convertToDTO(a, user.getId())) 
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> getDeletedHistory() {
        User user = getCurrentUser(); 
        checkAdminRole();
        return activityRepository.findAllDeletedNative()
                .stream()
                .map(a -> convertToDTO(a, user.getId())) 
                .toList();
    }

    @Transactional(readOnly = true)
    public ActivityDTO getActivityById(Long id) {
        Activity activity = activityRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(ACT_NOT_FOUND));
        
        User user = getCurrentUser();
        String role = user.getRole().getName();

        if (!role.equals(ADMIN_ROLE)) {
            List<Long> activityTeamIds = activity.getTeams().stream()
                    .map(Team::getId)
                    .toList();

            if (!activityTeamIds.isEmpty()) {
                List<Long> userTeamIds = user.getAffiliations().stream()
                        .map(aff -> aff.getTeam().getId())
                        .toList();

                boolean isMemberOfTeam = activityTeamIds.stream()
                        .anyMatch(userTeamIds::contains);

                if (!isMemberOfTeam) {
                    throw new UnauthorizedException("No tienes permiso para ver esta actividad.");
                }
            }
        }

        return convertToDTO(activity, user.getId()); 
    }

    // ACCIONES ADMIN / STAFF

    @Transactional
    public ActivityDTO createActivity(ActivityDTO dto) {
        User user = getCurrentUser(); 
        checkStaffOrAdminRole();

        validateDates(dto.getStartDate(), dto.getEndDate());

        Activity activity = new Activity();
        mapDtoToEntity(dto, activity);

        Activity saved = activityRepository.save(activity);
        log.info("Actividad creada: {}", saved.getName());
        return convertToDTO(saved, user.getId()); // Pasamos el ID
    }

    @Transactional
    public ActivityDTO updateActivity(Long id, ActivityDTO dto) {
        User user = getCurrentUser(); // Obtenemos el user actual
        checkStaffOrAdminRole();

        Activity activity = activityRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(ACT_NOT_FOUND));

        validateDates(dto.getStartDate(), dto.getEndDate());
        
        mapDtoToEntity(dto, activity);

        Activity saved = activityRepository.save(activity);
        return convertToDTO(saved, user.getId()); 
    }

    @Transactional
    public void deleteActivity(Long id) {
        checkStaffOrAdminRole(); // Solo Admin puede enviar al historial de bajas
        Activity activity = activityRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(ACT_NOT_FOUND));

        LocalDateTime now = LocalDateTime.now();

        activity.setDeletedAt(now);
        activity.setActive(false);

        // Borrado lógico en cascada de las inscripciones
        // Así mantenemos la integridad: si no hay actividad, no hay inscritos.
        if (activity.getRegistrations() != null) {
            activity.getRegistrations().forEach(reg -> {
                if (reg.getDeletedAt() == null) {
                    reg.setDeletedAt(now);
                    reg.setActive(false);
                }
            });
        }

        activityRepository.save(activity);
        log.info("Actividad '{}' y sus inscripciones han sido enviadas al historial de bajas", activity.getName());
    }

    // MÉTODOS AUXILIARES

    private void validateDates(LocalDateTime start, LocalDateTime end) {
        if (start.isBefore(LocalDateTime.now()) && start.isAfter(LocalDateTime.now().minusMinutes(1))) {
            throw new BadRequestException("La fecha de inicio no puede ser en el pasado");
        }
        if (end.isBefore(start)) {
            throw new BadRequestException("La fecha de fin no puede ser anterior a la de inicio");
        }
    }

    private void mapDtoToEntity(ActivityDTO dto, Activity entity) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setCapacity(dto.getCapacity());
        entity.setLocation(dto.getLocation());
        entity.setActive(dto.getActive() == null || dto.getActive());

        // Vincular equipos
        if (dto.getTeamIds() != null) {
            List<Team> teams = teamRepository.findAllById(dto.getTeamIds());
            entity.setTeams(teams);
        } else {
            entity.getTeams().clear();
        }
    }

    private ActivityDTO convertToDTO(Activity a, Long currentUserId) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(a.getId());
        dto.setName(a.getName());
        dto.setDescription(a.getDescription());
        dto.setStartDate(a.getStartDate());
        dto.setEndDate(a.getEndDate());
        dto.setCapacity(a.getCapacity());
        dto.setLocation(a.getLocation());
        dto.setActive(a.getActive());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        dto.setDeletedAt(a.getDeletedAt());

        // Mapeo de equipos
    dto.setTeamIds(a.getTeams().stream().map(Team::getId).toList());
    dto.setTeamNames(a.getTeams().stream().map(Team::getName).toList());

    // Cálculo de aforo
    dto.setRegisteredCount(registrationRepository.countByActivityIdAndDeletedAtIsNull(a.getId()));

    // DETERMINAR SI EL USUARIO ESTÁ INSCRITO
    if (currentUserId != null) {
        boolean isRegistered = registrationRepository
            .findByUserIdAndActivityIdAndDeletedAtIsNull(currentUserId, a.getId())
            .isPresent();
        dto.setUserRegistered(isRegistered);
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

    private void checkAdminRole() {
        if (!getCurrentUser().getRole().getName().equals(ADMIN_ROLE)) {
            throw new UnauthorizedException("Acceso denegado: Se requieren permisos de Administrador");
        }
    }

    private void checkStaffOrAdminRole() {
        String role = getCurrentUser().getRole().getName();
        if (!role.equals(ADMIN_ROLE) && !role.equals("STAFF")) {
            throw new UnauthorizedException("Acceso denegado: Solo Admin o Staff pueden gestionar actividades");
        }
    }
}