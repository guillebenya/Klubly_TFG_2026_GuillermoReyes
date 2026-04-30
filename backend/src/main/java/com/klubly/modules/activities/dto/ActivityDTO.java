package com.klubly.modules.activities.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ActivityDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer capacity;
    private String location;
    private Boolean active;

    // Relación con equipos (IDs para recibir del front, nombres para mostrar)
    private List<Long> teamIds;
    private List<String> teamNames;

    // Información de cupo para las cards
    private long registeredCount;
    
    // Campos de auditoría
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
