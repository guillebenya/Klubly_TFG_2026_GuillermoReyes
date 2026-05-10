package com.klubly.modules.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klubly.modules.identity.dto.ChangePasswordRequest;
import com.klubly.modules.identity.dto.UserDTO;
import com.klubly.modules.identity.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        // Usamos setters ya que UserDTO no tiene constructor con argumentos
        testUserDTO = new UserDTO();
        testUserDTO.setId(1L);
        testUserDTO.setUsername("guillermo");
        testUserDTO.setEmail("guillermo@test.com");
        testUserDTO.setFirstName("Guillermo");
        testUserDTO.setLastName("Reyes");
        testUserDTO.setPhone("600000000");
        testUserDTO.setActive(true);
        testUserDTO.setIsPending(false);
        testUserDTO.setRoleName("MEMBER");
    }

    @Test
    @DisplayName("GET /api/identity/users - Obtener todos los usuarios activos")
    void getAllActiveUsersShouldReturnList() throws Exception {
        List<UserDTO> users = Arrays.asList(testUserDTO);
        when(userService.getAllActiveUsers()).thenReturn(users);

        mockMvc.perform(get("/api/identity/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].username").value("guillermo"));
    }

    @Test
    @DisplayName("GET /api/identity/users/{id} - Obtener usuario por ID")
    void getUserByIdShouldReturnUser() throws Exception {
        when(userService.getUserById(1L)).thenReturn(testUserDTO);

        mockMvc.perform(get("/api/identity/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("guillermo"));
    }

    @Test
    @DisplayName("POST /api/identity/users/change-password - Cambiar contraseña")
    void changePasswordShouldReturnOk() throws Exception {
        // Corregido: Pasamos los 3 parámetros que espera tu Record según el Service
        // currentPassword, newPassword, confirmPassword
        ChangePasswordRequest request = new ChangePasswordRequest("oldPass123", "newPass123", "newPass123");
        
        doNothing().when(userService).changePassword(any(ChangePasswordRequest.class));

        mockMvc.perform(post("/api/identity/users/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Contraseña actualizada con éxito"));
    }

    @Test
    @DisplayName("PUT /api/identity/users/{id} - Actualizar usuario")
    void updateUserShouldReturnOk() throws Exception {
        when(userService.updateUser(eq(1L), any(UserDTO.class))).thenReturn(testUserDTO);

        mockMvc.perform(put("/api/identity/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("guillermo"));
    }

    @Test
    @DisplayName("DELETE /api/identity/users/{id} - Eliminar usuario")
    void deleteUserShouldReturnNoContent() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/identity/users/1"))
                .andExpect(status().isNoContent());
    }
}