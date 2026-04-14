package com.klubly.modules.identity.entity;

import com.klubly.common.entities.NamedEntity;
import jakarta.persistence.Entity;
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
public class Team extends NamedEntity {
    // Se hereda todo de NamedEntity, que a su vez hereda de BaseEntity, así que no es necesario agregar nada más aquí por ahora.
}
