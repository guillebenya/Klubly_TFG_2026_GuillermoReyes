package com.klubly.modules.inventory.entity;

import java.util.List;

import com.klubly.common.entities.NamedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories", uniqueConstraints = { @UniqueConstraint(columnNames = {"name", "deletedAt"}) } )
@Getter
@Setter
@NoArgsConstructor
public class Category extends NamedEntity {
    
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Item> items;
}
