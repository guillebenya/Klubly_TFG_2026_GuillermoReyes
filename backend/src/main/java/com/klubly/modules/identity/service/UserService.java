package com.klubly.modules.identity.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MSG));
        return convertToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MSG));
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO){

        //Comprobamos si username o email ya existen (solo entre los activos)
        if (userRepository.existsByUsernameAndDeletedAtIsNull(userDTO.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        if (userRepository.existsByEmailAndDeletedAtIsNull(userDTO.getEmail())) {
            throw new RuntimeException("El correo electrónico ya existe");
        }

        // Buscar el rol, ya que el DTO trae el roleId y necesitamos la entidad para asignarla al usuario
        Role role = roleRepository.findByIdAndDeletedAtIsNull(userDTO.getRoleId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Encriptar la contraseña
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setClubPosition(userDTO.getClubPosition());
        user.setAvatarURL(userDTO.getAvatarURL());
        user.setActive(true);
        user.setRole(role); // Asignar el rol al usuario

        User savedUser = userRepository.save(user);
        log.info("Nuevo usuario creado con éxito: {}", userDTO.getUsername());
        return convertToDTO(savedUser);
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO){
        //OBTENER USUARIO ACTUAL DEL CONTEXTO DE SEGURIDAD
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        //BUSCAR AL USUARIO QUE ESTÁ REALIZANDO LA ACCIÓN
        User actor = userRepository.findByUsernameAndDeletedAtIsNull(currentUsername)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

        //VALIDAR PERMISOS: Solo puede editar si es ADMIN o si es su propio ID
        boolean isAdmin = actor.getRole().getName().equals("ADMIN");
        boolean isOwner = actor.getId().equals(id);

    if (!isAdmin && !isOwner) {
        throw new RuntimeException("No tienes permiso para editar este perfil");
    }

        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MSG));

        // Si el username o email están cambiando, comprobamos que el nuevo valor no exista ya entre los activos
        if (!user.getUsername().equals(userDTO.getUsername()) && userRepository.existsByUsernameAndDeletedAtIsNull(userDTO.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        if (!user.getEmail().equals(userDTO.getEmail()) && userRepository.existsByEmailAndDeletedAtIsNull(userDTO.getEmail())) {
            throw new RuntimeException("El correo electrónico ya existe");
        }

        // Si se está cambiando el rol, buscamos la nueva entidad de rol
        if (!user.getRole().getId().equals(userDTO.getRoleId())) {
            Role role = roleRepository.findByIdAndDeletedAtIsNull(userDTO.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            user.setRole(role);
        }

        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword())); // Encriptar la nueva contraseña
        }
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhone(userDTO.getPhone());
        user.setClubPosition(userDTO.getClubPosition());
        user.setAvatarURL(userDTO.getAvatarURL());
        if (userDTO.getActive() != null) {
            user.setActive(userDTO.getActive());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
        
    }
    
    @Transactional
    public void deleteUser(Long id){
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND_MSG));

        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // Obtenemos el username del "Contexto de Seguridad" (quien está logueado)
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                                    .getContext().getAuthentication().getName();

        // Buscamos al usuario en la BD
        User user = userRepository.findByUsernameAndDeletedAtIsNull(currentUsername)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Comprobar si la contraseña actual es correcta
        // Usamos passwordEncoder.matches(plana, encriptada)
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new RuntimeException("La contraseña actual no es correcta");
        }

        // Comprobar que las nuevas coinciden
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new RuntimeException("Las nuevas contraseñas no coinciden");
        }

        // Encriptar la nueva y guardar
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        
        log.info("Usuario {} ha cambiado su contraseña", currentUsername);
    }

    // MÉTODO DE CONVERSIÓN PARA MAPEO MANUAL
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
            .collect(Collectors.toList()));
    }
        return dto;
    }
}
