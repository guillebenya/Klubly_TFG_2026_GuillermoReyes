package com.klubly.modules.identity.entity;

import com.klubly.common.entities.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "affiliations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "team_id", "deletedAt"})
})
@Getter
@Setter
@NoArgsConstructor
public class Affiliation extends BaseEntity{

    /*Una afiliación pertenece a un único usuario y a un único equipo. 
    Sin embargo, un usuario puede tener muchas afiliaciones (estar en varios equipos) 
    y un equipo tiene muchas afiliaciones (muchos jugadores), de ahí el ManyToOne*/

    //La mayoría de veces necesitaremos saber el rol a la vez, por lo que usamos EAGER.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // Este campo aquí es dinámico y deportivo, es para ver la función específica en un equipo.
    @Column(length = 50)
    private String position;
}
