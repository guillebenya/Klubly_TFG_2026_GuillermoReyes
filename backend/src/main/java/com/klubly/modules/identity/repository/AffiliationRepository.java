package com.klubly.modules.identity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klubly.modules.identity.entity.Affiliation;

@Repository
public interface AffiliationRepository extends JpaRepository<Affiliation, Long> {
    // Listado general de afiliaciones activas
    List<Affiliation> findByDeletedAtIsNull();

    // Para asegurar que al buscar por ID también respetamos el Soft Delete
    Optional<Affiliation> findByIdAndDeletedAtIsNull(Long id);

    // Listar afiliaciones por usuario (solo activas)
    List<Affiliation> findByUserIdAndDeletedAtIsNull(Long userId);

    // Listar afiliaciones por equipo (solo activas)
    List<Affiliation> findByTeamIdAndDeletedAtIsNull(Long teamId);

    // Para validar si una afiliación específica existe al crear o editar
    boolean existsByUserIdAndTeamIdAndDeletedAtIsNull(Long userId, Long teamId);
    void deleteByTeamId(Long teamId);
    
}
