package com.klubly.modules.identity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klubly.modules.identity.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByDeletedAtIsNull();
    Optional<Team> findByIdAndDeletedAtIsNull(Long id);
}
