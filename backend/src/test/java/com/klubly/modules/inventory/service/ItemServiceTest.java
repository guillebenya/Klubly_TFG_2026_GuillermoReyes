package com.klubly.modules.inventory.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.modules.inventory.dto.ItemDTO;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.entity.Item;
import com.klubly.modules.inventory.repository.CategoryRepository;
import com.klubly.modules.inventory.repository.ItemRepository;
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
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ItemService itemService;

    private Category testCategory;
    private Item testItem;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Material");

        testItem = new Item();
        testItem.setId(10L);
        testItem.setName("Balón Basket");
        testItem.setStockQuantity(20);
        testItem.setMinStock(5);
        testItem.setCategory(testCategory);
        testItem.setActive(true);
    }

    @AfterEach
    void tearDown() {
        // Limpiamos el contexto de seguridad para no afectar a otros tests
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
    @DisplayName("No debería permitir crear un artículo con stock negativo")
    void shouldThrowExceptionWhenStockIsNegative() {
        mockAuthenticatedRole("ROLE_ADMIN");

        ItemDTO dto = new ItemDTO();
        dto.setStockQuantity(-5);

        assertThrows(BadRequestException.class, () -> itemService.createItem(dto));
    }

    @Test
    @DisplayName("Admin debería poder actualizar todos los campos del artículo")
    void adminShouldUpdateEverything() {
        mockAuthenticatedRole("ROLE_ADMIN");

        ItemDTO updateDto = new ItemDTO();
        updateDto.setName("Balón Oficial"); 
        updateDto.setStockQuantity(50);
        updateDto.setCategoryId(1L);

        when(itemRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testItem));
        when(itemRepository.save(any(Item.class))).thenAnswer(i -> i.getArguments()[0]);

        ItemDTO result = itemService.updateItem(10L, updateDto);

        assertEquals("Balón Oficial", result.getName());
        assertEquals(50, result.getStockQuantity());
    }

    @Test
    @DisplayName("Staff solo debería poder actualizar stock y ubicación, ignorando cambios en nombre")
    void staffShouldOnlyUpdateStockAndLocation() {
        mockAuthenticatedRole("ROLE_STAFF");

        ItemDTO updateDto = new ItemDTO();
        updateDto.setName("Nombre Hackeado"); // Intento prohibido
        updateDto.setStockQuantity(15);      // Permitido
        updateDto.setLocation("Almacén B");  // Permitido
        updateDto.setCategoryId(1L);

        when(itemRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testItem));
        when(itemRepository.save(any(Item.class))).thenAnswer(i -> i.getArguments()[0]);

        ItemDTO result = itemService.updateItem(10L, updateDto);

        // El nombre debe permanecer igual al original (testItem) porque el Staff no tiene permiso para cambiarlo
        assertEquals("Balón Basket", result.getName()); 
        assertEquals(15, result.getStockQuantity());
        assertEquals("Almacén B", result.getLocation());
    }

    @Test
    @DisplayName("Debería fallar al crear un artículo si la categoría no existe")
    void shouldFailWhenCategoryDoesNotExist() {
        mockAuthenticatedRole("ROLE_ADMIN");

        ItemDTO dto = new ItemDTO();
        dto.setName("Nuevo Item");
        dto.setCategoryId(99L);
        dto.setStockQuantity(10);
        dto.setMinStock(1);

        when(categoryRepository.findByIdAndDeletedAtIsNull(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.createItem(dto));
    }

    @Test
    @DisplayName("Debería realizar borrado lógico del artículo")
    void shouldPerformSoftDeleteItem() {
        mockAuthenticatedRole("ROLE_ADMIN");

        when(itemRepository.findByIdAndDeletedAtIsNull(10L)).thenReturn(Optional.of(testItem));

        itemService.deleteItem(10L);

        assertNotNull(testItem.getDeletedAt());
        assertFalse(testItem.getActive());
        verify(itemRepository).save(testItem);
    }
}