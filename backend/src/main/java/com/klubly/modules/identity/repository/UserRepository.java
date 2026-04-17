package com.klubly.modules.identity.repository;

import com.klubly.modules.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //Listado general (solo usuarios activos)
    List<User> findByDeletedAtIsNull();

    //Para el login y para buscar perfiles (solo activos)
    Optional<User> findByUsernameAndDeletedAtIsNull(String username);
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    //Para validar si el usuario existe al crear o editar
    boolean existsByUsernameAndDeletedAtIsNull(String username);
    boolean existsByEmailAndDeletedAtIsNull(String email);
}
