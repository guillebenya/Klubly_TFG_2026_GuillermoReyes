package com.klubly.modules.identity.entity;

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
@Table(name = "roles", uniqueConstraints = { @UniqueConstraint(columnNames = {"name", "deletedAt"}) } )
@Getter
@Setter
@NoArgsConstructor
public class Role extends NamedEntity {
    //Relación bidireccional: Un rol puede tener muchos usuarios
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    private List<User> users;
}
