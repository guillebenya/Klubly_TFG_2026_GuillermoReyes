package com.klubly.modules.identity.dto;

import lombok.Data;

@Data
public class AffiliationDTO {
    private Long id;
    private Long userId;
    private Long teamId;
    private String teamPosition; // Posición del usuario en este equipo específico.

    private String username; // Para mostrar el nombre de usuario sin necesidad de otra consulta
    private String teamName; // Para mostrar el nombre del equipo sin necesidad de otra consulta
    private String clubPosition; // Para mostrar la posición del usuario en el club sin necesidad de otra consulta
}
