package com.klubly.modules.identity.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;

    @NotBlank(groups = OnCreate.class, message = "La contraseña es obligatoria al crear un usuario")
    @Size(min = 6, groups = {OnCreate.class, OnUpdate.class}, message = "La contraseña debe tener al menos 6 caracteres")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String firstName;
    private String lastName;
    private String phone;
    private String clubPosition;
    private String avatarURL;
    private Boolean active;

    private Boolean isPending;

    private Long roleId;
    private String roleName; //Para que el front muestre el nombre del rol sin necesidad de hacer otra consulta

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    private List<AffiliationDTO> affiliations; // Para mostrar las afiliaciones del usuario

    public interface OnCreate {}
    public interface OnUpdate {}
}
