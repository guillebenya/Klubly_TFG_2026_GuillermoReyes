package com.klubly.modules.identity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klubly.modules.identity.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    // Para listar solo los equipos activos
    List<Team> findByDeletedAtIsNull();
    // Para asegurar que al buscar por ID también respetamos el Soft Delete
    Optional<Team> findByIdAndDeletedAtIsNull(Long id);
    Optional<Team> findByNameAndDeletedAtIsNull(String name);
    // Para validar si el equipo existe al crear o editar
    boolean existsByNameAndDeletedAtIsNull(String name);
}
