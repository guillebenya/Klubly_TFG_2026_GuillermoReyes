package com.klubly.modules.identity.repository;

import com.klubly.modules.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    //Listado de todos los roles (solo activos)
    List<Role> findByDeletedAtIsNull();
    Optional<Role> findByNameAndDeletedAtIsNull(String name);

    // Para asegurar que al buscar por ID también respetamos el Soft Delete
    Optional<Role> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByNameAndDeletedAtIsNull(String name);
}
