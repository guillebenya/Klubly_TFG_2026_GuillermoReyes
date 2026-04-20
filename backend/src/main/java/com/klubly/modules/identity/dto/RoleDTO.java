package com.klubly.modules.identity.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RoleDTO {
    private Long id;
    private String name;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}