package com.klubly.modules.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klubly.modules.identity.dto.AffiliationDTO;
import com.klubly.modules.identity.service.AffiliationService;
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
class AffiliationControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AffiliationService affiliationService;

    @InjectMocks
    private AffiliationController affiliationController;

    private AffiliationDTO testAffiliationDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(affiliationController).build();

        testAffiliationDTO = new AffiliationDTO();
        testAffiliationDTO.setId(1L);
        testAffiliationDTO.setUserId(10L);
        testAffiliationDTO.setTeamId(5L);
        testAffiliationDTO.setTeamName("Equipo Senior");
        testAffiliationDTO.setTeamPosition("Jugador");
    }

    @Test
    @DisplayName("GET /api/identity/affiliations - Obtener todas las activas")
    void getAllShouldReturnList() throws Exception {
        List<AffiliationDTO> list = Arrays.asList(testAffiliationDTO);
        when(affiliationService.getAllActiveAffiliations()).thenReturn(list);

        mockMvc.perform(get("/api/identity/affiliations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].teamName").value("Equipo Senior"));
    }

    @Test
    @DisplayName("GET /api/identity/affiliations/{id} - Obtener por ID")
    void getByIdShouldReturnAffiliation() throws Exception {
        when(affiliationService.getAffiliationById(1L)).thenReturn(testAffiliationDTO);

        mockMvc.perform(get("/api/identity/affiliations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamPosition").value("Jugador"));
    }

    @Test
    @DisplayName("GET /api/identity/affiliations/user/{userId} - Obtener por usuario")
    void getByUserIdShouldReturnList() throws Exception {
        List<AffiliationDTO> list = Arrays.asList(testAffiliationDTO);
        when(affiliationService.getAffiliationsByUserId(10L)).thenReturn(list);

        mockMvc.perform(get("/api/identity/affiliations/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(10L));
    }

    @Test
    @DisplayName("POST /api/identity/affiliations - Crear afiliación")
    void createShouldReturnCreated() throws Exception {
        when(affiliationService.createAffiliation(any(AffiliationDTO.class))).thenReturn(testAffiliationDTO);

        mockMvc.perform(post("/api/identity/affiliations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAffiliationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("PUT /api/identity/affiliations/{id} - Actualizar afiliación")
    void updateShouldReturnOk() throws Exception {
        when(affiliationService.updateAffiliation(eq(1L), any(AffiliationDTO.class))).thenReturn(testAffiliationDTO);

        mockMvc.perform(put("/api/identity/affiliations/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAffiliationDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamName").value("Equipo Senior"));
    }

    @Test
    @DisplayName("DELETE /api/identity/affiliations/{id} - Eliminar afiliación")
    void deleteShouldReturnNoContent() throws Exception {
        doNothing().when(affiliationService).deleteAffiliation(1L);

        mockMvc.perform(delete("/api/identity/affiliations/1"))
                .andExpect(status().isNoContent());
    }
}