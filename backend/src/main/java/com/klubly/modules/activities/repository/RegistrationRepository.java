package com.klubly.modules.activities.repository;

import com.klubly.modules.activities.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByIdAndDeletedAtIsNull(Long id);
    // Buscar inscripciones de una actividad específica
    List<Registration> findByActivityIdAndDeletedAtIsNull(Long activityId);

    // Contar cuántos inscritos hay actualmente en una actividad
    long countByActivityIdAndDeletedAtIsNull(Long activityId);

    // Comprobar si un usuario ya está inscrito en una actividad
    Optional<Registration> findByUserIdAndActivityIdAndDeletedAtIsNull(Long userId, Long activityId);

    // Historial del usuario
    List<Registration> findByUserIdAndDeletedAtIsNull(Long userId);
}