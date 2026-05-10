package com.klubly.modules.activities.controller;

import com.klubly.modules.activities.dto.RegistrationDTO;
import com.klubly.modules.activities.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RegistrationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RegistrationService registrationService;

    @InjectMocks
    private RegistrationController registrationController;

    private RegistrationDTO testRegistrationDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(registrationController).build();

        // Inicializamos un DTO de prueba usando setters
        testRegistrationDTO = new RegistrationDTO();
        testRegistrationDTO.setId(1L);
        testRegistrationDTO.setUserId(10L);
        testRegistrationDTO.setActivityId(5L);
        testRegistrationDTO.setRegistrationDate(LocalDateTime.now());
    }

    @Test
    @DisplayName("GET /api/registrations/activity/{id} - Listar inscritos de una actividad")
    void getRegistrationsByActivityShouldReturnList() throws Exception {
        List<RegistrationDTO> list = Arrays.asList(testRegistrationDTO);
        when(registrationService.getRegistrationsByActivity(5L)).thenReturn(list);

        mockMvc.perform(get("/api/registrations/activity/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].userId").value(10L));
    }

    @Test
    @DisplayName("POST /api/registrations/activity/{aId}/user/{uId} - Inscripción manual")
    void addRegistrationManualShouldReturnCreated() throws Exception {
        when(registrationService.addRegistrationManual(5L, 10L)).thenReturn(testRegistrationDTO);

        mockMvc.perform(post("/api/registrations/activity/5/user/10"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("DELETE /api/registrations/{id} - Eliminar inscripción manual")
    void removeRegistrationManualShouldReturnNoContent() throws Exception {
        doNothing().when(registrationService).removeRegistrationManual(1L);

        mockMvc.perform(delete("/api/registrations/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /api/registrations/activity/{id}/self - Autoinscripción del socio")
    void registerSelfShouldReturnCreated() throws Exception {
        when(registrationService.registerCurrentUser(5L)).thenReturn(testRegistrationDTO);

        mockMvc.perform(post("/api/registrations/activity/5/self"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.activityId").value(5L));
    }

    @Test
    @DisplayName("DELETE /api/registrations/activity/{id}/self - El socio se desapunta")
    void unregisterSelfShouldReturnNoContent() throws Exception {
        doNothing().when(registrationService).unregisterCurrentUser(5L);

        mockMvc.perform(delete("/api/registrations/activity/5/self"))
                .andExpect(status().isNoContent());
    }
}