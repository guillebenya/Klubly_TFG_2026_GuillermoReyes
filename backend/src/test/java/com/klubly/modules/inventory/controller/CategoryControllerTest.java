package com.klubly.modules.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klubly.modules.inventory.dto.CategoryDTO;
import com.klubly.modules.inventory.service.CategoryService;
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
class CategoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private CategoryDTO testCategoryDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController).build();

        testCategoryDTO = new CategoryDTO();
        testCategoryDTO.setId(1L);
        testCategoryDTO.setName("Material Deportivo");
        testCategoryDTO.setDescription("Balones, conos y petos");
    }

    @Test
    @DisplayName("GET /api/inventory/categories - Listar todas las activas")
    void getAllCategoriesShouldReturnList() throws Exception {
        List<CategoryDTO> list = Arrays.asList(testCategoryDTO);
        when(categoryService.getAllActiveCategories()).thenReturn(list);

        mockMvc.perform(get("/api/inventory/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("Material Deportivo"));
    }

    @Test
    @DisplayName("GET /api/inventory/categories/{id} - Obtener categoría por ID")
    void getCategoryByIdShouldReturnCategory() throws Exception {
        when(categoryService.getCategoryById(1L)).thenReturn(testCategoryDTO);

        mockMvc.perform(get("/api/inventory/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Material Deportivo"));
    }

    @Test
    @DisplayName("GET /api/inventory/categories/history/deleted - Listar borradas")
    void getDeletedHistoryShouldReturnList() throws Exception {
        List<CategoryDTO> list = Arrays.asList(testCategoryDTO);
        when(categoryService.getAllDeletedCategories()).thenReturn(list);

        mockMvc.perform(get("/api/inventory/categories/history/deleted"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    @DisplayName("POST /api/inventory/categories - Crear categoría")
    void createCategoryShouldReturnCreated() throws Exception {
        when(categoryService.createCategory(any(CategoryDTO.class))).thenReturn(testCategoryDTO);

        mockMvc.perform(post("/api/inventory/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCategoryDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Material Deportivo"));
    }

    @Test
    @DisplayName("PUT /api/inventory/categories/{id} - Actualizar categoría")
    void updateCategoryShouldReturnOk() throws Exception {
        when(categoryService.updateCategory(eq(1L), any(CategoryDTO.class))).thenReturn(testCategoryDTO);

        mockMvc.perform(put("/api/inventory/categories/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCategoryDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Material Deportivo"));
    }

    @Test
    @DisplayName("DELETE /api/inventory/categories/{id} - Borrado lógico")
    void deleteCategoryShouldReturnNoContent() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/inventory/categories/1"))
                .andExpect(status().isNoContent());
    }
}