package com.klubly.modules.identity.dto;

import lombok.Data;

@Data
public class TeamDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
}