package com.klubly.modules.activities.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.klubly.modules.activities.entity.Activity;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Optional<Activity> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByNameIgnoreCaseAndStartDateBetweenAndDeletedAtIsNull(String name, LocalDateTime start, LocalDateTime end);

    // Listar activas
    List<Activity> findByDeletedAtIsNullOrderByStartDateAsc();

    // Listar eliminadas (Historial)
    @Query(value = "SELECT * FROM activities WHERE deleted_at IS NOT NULL", nativeQuery = true)
    List<Activity> findAllDeletedNative();

    // Filtro para STAFF/MEMBER: Ver actividades de sus equipos o globales (sin equipos)
    @Query("SELECT DISTINCT a FROM Activity a LEFT JOIN a.teams t " +
           "WHERE a.deletedAt IS NULL AND (t.id IN :teamIds OR t.id IS NULL) " +
           "ORDER BY a.startDate Asc")
    List<Activity> findByTeamIdsInOrGlobal(@Param("teamIds") List<Long> teamIds);

    // Filtros por fecha
    List<Activity> findByStartDateBetweenAndDeletedAtIsNull(LocalDateTime start, LocalDateTime end);
}
