package com.klubly.modules.inventory.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klubly.core.exception.BadRequestException;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.core.exception.UnauthorizedException;
import com.klubly.modules.inventory.dto.ItemDTO;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.entity.Item;
import com.klubly.modules.inventory.repository.CategoryRepository;
import com.klubly.modules.inventory.repository.ItemRepository;

import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    private static final String ITEM_NOT_FOUND_MSG = "Artículo no encontrado";

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllActiveItems() {
        checkStaffOrAdminRole();
        return itemRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllDeletedItems() {
        checkAdminRole();
        return itemRepository.findAllDeletedNative()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ItemDTO getItemById(Long id) {
        checkStaffOrAdminRole();
        return itemRepository.findByIdAndDeletedAtIsNull(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException(ITEM_NOT_FOUND_MSG));
    }

    @Transactional(readOnly = true)
    public ItemDTO getItemByName(String name) {
        checkStaffOrAdminRole();
        return itemRepository.findByNameAndDeletedAtIsNull(name)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException(ITEM_NOT_FOUND_MSG));
    }

    @Transactional
    public ItemDTO createItem(ItemDTO itemDTO) {
        checkAdminRole();
        if (itemDTO.getStockQuantity() < 0 || itemDTO.getMinStock() < 0) {
            throw new BadRequestException("El stock y el stock mínimo no pueden ser valores negativos");
        }

        if (itemRepository.existsByNameAndDeletedAtIsNull(itemDTO.getName())) {
            throw new BadRequestException("El nombre de artículo ya existe");
        }

        Item item = new Item();
        item.setName(itemDTO.getName());
        item.setDescription(itemDTO.getDescription());
        item.setStockQuantity(itemDTO.getStockQuantity());
        item.setMinStock(itemDTO.getMinStock());
        item.setLocation(itemDTO.getLocation());

        if (itemDTO.getCategoryId() == null) {
            throw new BadRequestException("Debes asignar una categoría al artículo");
        }

        categoryRepository.findByIdAndDeletedAtIsNull(itemDTO.getCategoryId())
                .ifPresentOrElse(
                        item::setCategory,
                        () -> { throw new ResourceNotFoundException("Categoría no encontrada"); }
                );

        item.setActive(itemDTO.getActive() == null || itemDTO.getActive());
        Item savedItem = itemRepository.save(item);
        return convertToDTO(savedItem);
    }

    @Transactional
    public ItemDTO updateItem(Long id, ItemDTO itemDTO) {
        User currentUser = checkStaffOrAdminRole();

        Item item = itemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(ITEM_NOT_FOUND_MSG));

        if (itemDTO.getStockQuantity() < 0 || itemDTO.getMinStock() < 0) {
            throw new BadRequestException("El stock y el stock mínimo no pueden ser valores negativos");
        }

        if (itemDTO.getCategoryId() == null) {
        throw new BadRequestException("El artículo debe tener una categoría asignada");
    }

        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getName());

        if (isAdmin) {
            // Solo el ADMIN puede cambiar el nombre y validamos unicidad
            if (!item.getName().equals(itemDTO.getName())) {
                if (itemRepository.existsByNameAndDeletedAtIsNull(itemDTO.getName())) {
                    throw new BadRequestException("El nombre de artículo ya existe");
                }
                item.setName(itemDTO.getName());
            }

            item.setDescription(itemDTO.getDescription());
            item.setMinStock(itemDTO.getMinStock());
            
            if (itemDTO.getActive() != null) {
                item.setActive(itemDTO.getActive());
            }

            // Cambio de Categoría (Solo ADMIN)
            if (item.getCategory() == null || !item.getCategory().getId().equals(itemDTO.getCategoryId())) {
                Category category = categoryRepository.findByIdAndDeletedAtIsNull(itemDTO.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
                item.setCategory(category);
            }
        }

        //CAMPOS QUE CUALQUIERA PUEDE MODIFICAR (Staff / Admin)
        item.setStockQuantity(itemDTO.getStockQuantity());
        item.setLocation(itemDTO.getLocation());

        Item updatedItem = itemRepository.save(item);
        return convertToDTO(updatedItem);
    }

    @Transactional
    public void deleteItem(Long id) {
        checkAdminRole();
        Item item = itemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException(ITEM_NOT_FOUND_MSG));

        item.setDeletedAt(java.time.LocalDateTime.now());
        item.setActive(false);
        itemRepository.save(item);
    }

    //Método de conversión
    private ItemDTO convertToDTO(Item item) {
        ItemDTO itemDTO = new ItemDTO();
        itemDTO.setId(item.getId());
        itemDTO.setName(item.getName());
        itemDTO.setDescription(item.getDescription());
        itemDTO.setStockQuantity(item.getStockQuantity());
        itemDTO.setMinStock(item.getMinStock());
        itemDTO.setLocation(item.getLocation());

        if (item.getCategory() != null) {
            itemDTO.setCategoryId(item.getCategory().getId());
            itemDTO.setCategoryName(item.getCategory().getName());
        }

        itemDTO.setActive(item.getActive());
        itemDTO.setCreatedAt(item.getCreatedAt());
        itemDTO.setUpdatedAt(item.getUpdatedAt());
        itemDTO.setDeletedAt(item.getDeletedAt());
        return itemDTO;
    }

    //Métodos auxiliares
    private String getContextRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        return authentication.getAuthorities().iterator().next().getAuthority();
    }

    private User getCurrentDbUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        // Buscamos al usuario en caliente en la DB para conocer su estado real de permisos
        return userRepository.findByUsernameAndDeletedAtIsNull(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuario inválido o dado de baja del club"));
    }

    private void checkAdminRole() {
        User user = getCurrentDbUser();
        if (!"ADMIN".equals(user.getRole().getName())) {
            log.warn("ALERTA SEGURIDAD: Usuario '{}' intentó acción de ADMIN teniendo rol DB: '{}'", user.getUsername(), user.getRole().getName());
            throw new AccessDeniedException("Acceso denegado: Se requieren permisos de administrador");
        }
    }

    private User checkStaffOrAdminRole() {
        User user = getCurrentDbUser();
        String roleName = user.getRole().getName();
        if (!"ADMIN".equals(roleName) && !"STAFF".equals(roleName)) {
            log.warn("ALERTA SEGURIDAD: Usuario '{}' intentó acción de INVENTARIO teniendo rol DB: '{}'", user.getUsername(), roleName);
            // Lanzar AccessDeniedException de Spring provoca un 403 Forbidden nativo hacia el Front
            throw new AccessDeniedException("Acceso denegado: No tienes privilegios para gestionar el inventario");
        }
        return user;
    }
}
