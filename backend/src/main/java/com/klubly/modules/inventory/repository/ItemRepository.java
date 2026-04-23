package com.klubly.modules.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klubly.modules.inventory.entity.Item;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByDeletedAtIsNull();
    Optional<Item> findByIdAndDeletedAtIsNull(Long id);
    Optional<Item> findByNameAndDeletedAtIsNull(String name);
    boolean existsByNameAndDeletedAtIsNull(String name);
}
