package com.klubly.modules.activities.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RegistrationDTO {
    private Long id;
    private Long userId;
    private Long activityId;
    private LocalDateTime registrationDate;
    private Boolean active;

    // Datos del socio para el listado de Gestionar Inscripciones
    private String userFullName;
    private String userEmail;
    private String userPhone;
    
    // Datos de contexto del socio
    private String teamName;
    private String teamPosition;

    // Auditoría
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
}
