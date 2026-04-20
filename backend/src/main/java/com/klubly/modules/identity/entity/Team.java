package com.klubly.modules.identity.entity;

import java.util.ArrayList;
import java.util.List;

import com.klubly.common.entities.NamedEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "teams", uniqueConstraints = { @UniqueConstraint(columnNames = {"name", "deletedAt"}) } )
@Getter
@Setter
@NoArgsConstructor
public class Team extends NamedEntity {
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
        private List<Affiliation> affiliations = new ArrayList<>();
    }
