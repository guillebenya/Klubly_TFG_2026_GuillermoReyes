package com.klubly.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klubly.modules.inventory.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByDeletedAtIsNull();
    Optional<Category> findByIdAndDeletedAtIsNull(Long id);
    Optional<Category> findByNameAndDeletedAtIsNull(String name);
    boolean existsByNameAndDeletedAtIsNull(String name);
}
