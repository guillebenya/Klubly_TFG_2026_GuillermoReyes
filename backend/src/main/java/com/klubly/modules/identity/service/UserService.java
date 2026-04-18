package com.klubly.modules.identity.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klubly.modules.identity.dto.UserDTO;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;

import jakarta.transaction.Transactional;
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

    public List<UserDTO> getAllActiveUsers() {
        return userRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
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
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getId());
            dto.setRoleName(user.getRole().getName());
        }
        return dto;
    }
}
