package com.klubly.modules.identity.service;

import com.klubly.modules.identity.dto.RoleDTO;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private static final String ROLE_NOT_FOUND_MSG = "Rol no encontrado";

    public List<RoleDTO> getAllActiveRoles() {
        return roleRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException(ROLE_NOT_FOUND_MSG));
        return convertToDTO(role);
    }

    @Transactional
    public RoleDTO createRole(RoleDTO roleDTO) {
        Role role = new Role();
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        role.setActive(true);

        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    @Transactional
    public RoleDTO updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .filter(t -> t.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException(ROLE_NOT_FOUND_MSG));

        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        if (roleDTO.getActive() != null) {
            role.setActive(roleDTO.getActive());
        }

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ROLE_NOT_FOUND_MSG));
        
        role.setDeletedAt(LocalDateTime.now());
        role.setActive(false);
        roleRepository.save(role);
    }

    // MÉTODOS DE CONVERSIÓN (Mapeo manual)
    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setActive(role.getActive());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        dto.setDeletedAt(role.getDeletedAt());
        return dto;
    }
}