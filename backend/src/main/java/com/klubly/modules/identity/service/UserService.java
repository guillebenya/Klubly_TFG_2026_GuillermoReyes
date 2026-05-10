package com.klubly.modules.identity.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.identity.dto.AffiliationDTO;
import com.klubly.modules.identity.dto.ChangePasswordRequest;
import com.klubly.modules.identity.dto.UserDTO;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private static final String USER_NOT_FOUND_MSG = "Usuario no encontrado";

    @Transactional(readOnly = true)
    public List<UserDTO> getAllActiveUsers() {
        return userRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public List<UserDTO> getAllDeletedUsers() {
        return userRepository.findByDeletedAtIsNotNull()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));
        return convertToDTO(user);
    }

    public List<UserDTO> getUsersByTeam(Long teamId) {
    return userRepository.findByTeamId(teamId).stream()
            .map(this::convertToDTO)
            .toList();
}

    @Transactional
    public UserDTO createUser(UserDTO userDTO){
        checkAdminRole();
        if (userRepository.existsByUsernameAndDeletedAtIsNull(userDTO.getUsername())) {
            throw new BadRequestException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(userDTO.getEmail())) {
            throw new BadRequestException("El correo electrónico ya existe");
        }

        Role role = roleRepository.findByIdAndDeletedAtIsNull(userDTO.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setClubPosition(userDTO.getClubPosition());
        user.setAvatarURL(userDTO.getAvatarURL());
        user.setActive(userDTO.getActive() == null || userDTO.getActive());
        
        // Al crear desde Admin, el usuario no nace como pendiente
        user.setIsPending(userDTO.getIsPending() != null && userDTO.getIsPending());
        
        user.setRole(role);

        User savedUser = userRepository.save(user);
        log.info("Nuevo usuario creado con éxito: {}", userDTO.getUsername());
        return convertToDTO(savedUser);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User actor = getAuthenticatedUser();
        boolean isAdmin = actor.getRole().getName().equals("ADMIN");
        boolean isOwner = actor.getId().equals(id);

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("No tienes permiso para editar este perfil");
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));

        if (isAdmin) {
            updateAdminRestrictedFields(user, userDTO, isOwner);
        }

        updateBasicFields(user, userDTO);

        return convertToDTO(userRepository.save(user));
    }
    
    @Transactional
    public void deleteUser(Long id){
        checkAdminRole();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        String currentUsername = authentication.getName();
        User actor = userRepository.findByUsernameAndDeletedAtIsNull(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));

        boolean isOwner = actor.getId().equals(id);
        if (isOwner) {
            throw new BadRequestException("Por seguridad, no puedes eliminar tu propio usuario");
        }
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));

        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                                    .getContext().getAuthentication().getName();

        User user = userRepository.findByUsernameAndDeletedAtIsNull(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND_MSG));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("La contraseña actual no es correcta");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Las nuevas contraseñas no coinciden");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        
        log.info("Usuario {} ha cambiado su contraseña", currentUsername);
    }

    // Métodos auxiliares

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setClubPosition(user.getClubPosition());
        dto.setAvatarURL(user.getAvatarURL());
        dto.setActive(user.getActive());
        dto.setIsPending(user.getIsPending());

        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setDeletedAt(user.getDeletedAt());
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleName(user.getRole().getName());
        }
        if (user.getAffiliations() != null) {
            dto.setAffiliations(user.getAffiliations().stream()
            .filter(aff -> aff.getDeletedAt() == null)    
            .map(aff -> {
                    AffiliationDTO affDto = new AffiliationDTO();
                    affDto.setId(aff.getId());
                    affDto.setTeamId(aff.getTeam().getId());
                    affDto.setTeamName(aff.getTeam().getName());
                    affDto.setTeamPosition(aff.getTeamPosition());
                    return affDto;
                })
                .toList());
        }
        return dto;
    }

    private String getContextRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        return authentication.getAuthorities().iterator().next().getAuthority();
    }

    private void checkAdminRole() {
        if (!"ROLE_ADMIN".equals(getContextRole())) {
            throw new UnauthorizedException("Acceso denegado: Se requieren permisos de administrador");
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        return userRepository.findByUsernameAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado"));
    }

    // Lógica exclusiva de administrador
    private void updateAdminRestrictedFields(User user, UserDTO userDTO, boolean isOwner) {
        if (!user.getUsername().equals(userDTO.getUsername())) {
            if (userRepository.existsByUsernameAndDeletedAtIsNull(userDTO.getUsername())) {
                throw new BadRequestException("El nombre de usuario ya existe");
            }
            user.setUsername(userDTO.getUsername());
        }
        
        if (!user.getEmail().equals(userDTO.getEmail())) {
            if (userRepository.existsByEmailAndDeletedAtIsNull(userDTO.getEmail())) {
                throw new BadRequestException("El correo electrónico ya existe");
            }
            user.setEmail(userDTO.getEmail());
        }

        if (userDTO.getRoleId() != null && !user.getRole().getId().equals(userDTO.getRoleId())) {
            if (isOwner) {
                throw new BadRequestException("Por seguridad, no puedes cambiar tu propio rol de Administrador");
            }
            Role role = roleRepository.findByIdAndDeletedAtIsNull(userDTO.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));
            user.setRole(role);
        }

        user.setClubPosition(userDTO.getClubPosition());

        if (userDTO.getActive() != null) {
            if (isOwner && Boolean.FALSE.equals(userDTO.getActive())) {
                throw new BadRequestException("No puedes desactivar tu propia cuenta de Administrador");
            }
            user.setActive(userDTO.getActive());
        }

        if (userDTO.getIsPending() != null) {
            user.setIsPending(userDTO.getIsPending());
        }
    }

    // Campos básicos que cualquiera puede editar
    private void updateBasicFields(User user, UserDTO userDTO) {
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setAvatarURL(userDTO.getAvatarURL());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
    }
}