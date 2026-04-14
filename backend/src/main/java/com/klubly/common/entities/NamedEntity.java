package com.klubly.common.entities;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter 
@Setter
public abstract class NamedEntity extends BaseEntity {
    private String name;

    @Column(length = 255)
    private String description;
}
