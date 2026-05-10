package com.klubly.modules.inventory.service;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.inventory.dto.CategoryDTO;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.entity.Item;
import com.klubly.modules.inventory.repository.CategoryRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.quality.Strictness;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Equipaciones");
        testCategory.setDescription("Ropa oficial del club");
        testCategory.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos la seguridad para evitar efectos secundarios entre tests
        SecurityContextHolder.clearContext();
    }

    //Helper para simular un rol en el contexto de seguridad de Spring
    private void mockAuthenticatedRole(String role) {
        Authentication auth = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        
        doReturn(Collections.singletonList(new SimpleGrantedAuthority(role)))
            .when(auth).getAuthorities();
        when(auth.isAuthenticated()).thenReturn(true);
        when(securityContext.getAuthentication()).thenReturn(auth);
        
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Debería retornar una categoría con el conteo de artículos activos correcto")
    void shouldReturnCategoryWithActiveItemCount() {
        // Simulamos 2 artículos activos y 1 borrado
        Item active1 = new Item();
        active1.setDeletedAt(null);
        Item active2 = new Item();
        active2.setDeletedAt(null);
        Item deletedItem = new Item();
        deletedItem.setDeletedAt(java.time.LocalDateTime.now());

        testCategory.setItems(List.of(active1, active2, deletedItem));

        when(categoryRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(testCategory));

        CategoryDTO result = categoryService.getCategoryById(1L);

        assertNotNull(result);
        assertEquals(2, result.getItemCount(), "El conteo debería ignorar los artículos borrados");
        assertEquals("Equipaciones", result.getName());
    }

    @Test
    @DisplayName("No debería permitir crear una categoría con un nombre que ya existe")
    void shouldThrowExceptionWhenCategoryNameExistsOnCreate() {
        mockAuthenticatedRole("ROLE_ADMIN");

        CategoryDTO dto = new CategoryDTO();
        dto.setName("Equipaciones");

        when(categoryRepository.existsByNameAndDeletedAtIsNull("Equipaciones")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> categoryService.createCategory(dto));
    }

    @Test
    @DisplayName("No debería permitir borrar una categoría que tiene artículos asociados")
    void shouldThrowExceptionWhenDeletingCategoryWithItems() {
        mockAuthenticatedRole("ROLE_ADMIN");

        // Añadimos un artículo activo a la categoría
        Item item = new Item();
        item.setDeletedAt(null);
        testCategory.setItems(List.of(item));

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            categoryService.deleteCategory(1L)
        );

        assertTrue(ex.getMessage().contains("tiene artículos asociados"));
    }

    @Test
    @DisplayName("Debería realizar el borrado lógico si la categoría está vacía")
    void shouldPerformSoftDeleteSuccessfully() {
        mockAuthenticatedRole("ROLE_ADMIN");

        testCategory.setItems(Collections.emptyList());
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));

        categoryService.deleteCategory(1L);

        assertNotNull(testCategory.getDeletedAt());
        assertFalse(testCategory.getActive());
        verify(categoryRepository).save(testCategory);
    }

    @Test
    @DisplayName("Debería denegar el acceso a la creación de categorías si no es ADMIN")
    void shouldDenyAccessToNonAdmin() {
        mockAuthenticatedRole("ROLE_STAFF");

        CategoryDTO dto = new CategoryDTO();
        assertThrows(UnauthorizedException.class, () -> categoryService.createCategory(dto));
    }
}