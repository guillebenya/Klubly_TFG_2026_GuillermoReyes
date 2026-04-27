package com.klubly.modules.inventory.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klubly.modules.inventory.dto.ItemDTO;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.entity.Item;
import com.klubly.modules.inventory.repository.CategoryRepository;
import com.klubly.modules.inventory.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private static final String ITEM_NOT_FOUND_MSG = "Artículo no encontrado";

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllActiveItems() {
        return itemRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllDeletedItems() {
        checkAdminRole();
        return itemRepository.findAllDeletedNative()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ItemDTO getItemById(Long id) {
        return itemRepository.findByIdAndDeletedAtIsNull(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException(ITEM_NOT_FOUND_MSG));
    }

    @Transactional(readOnly = true)
    public ItemDTO getItemByName(String name) {
        return itemRepository.findByNameAndDeletedAtIsNull(name)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException(ITEM_NOT_FOUND_MSG));
    }

    @Transactional
    public ItemDTO createItem(ItemDTO itemDTO) {
        checkAdminRole();
        if (itemDTO.getStockQuantity() < 0 || itemDTO.getMinStock() < 0) {
            throw new RuntimeException("El stock y el stock mínimo no pueden ser valores negativos");
        }

        if (itemRepository.existsByNameAndDeletedAtIsNull(itemDTO.getName())) {
            throw new RuntimeException("El nombre de artículo ya existe");
        }

        Item item = new Item();
        item.setName(itemDTO.getName());
        item.setDescription(itemDTO.getDescription());
        item.setStockQuantity(itemDTO.getStockQuantity());
        item.setMinStock(itemDTO.getMinStock());
        item.setLocation(itemDTO.getLocation());

        if (itemDTO.getCategoryId() == null) {
            throw new RuntimeException("Debes asignar una categoría al artículo");
        }

        categoryRepository.findByIdAndDeletedAtIsNull(itemDTO.getCategoryId())
                .ifPresentOrElse(
                        category -> item.setCategory(category),
                        () -> { throw new RuntimeException("Categoría no encontrada"); }
                );

        item.setActive(true);
        Item savedItem = itemRepository.save(item);
        return convertToDTO(savedItem);
    }

    @Transactional
    public ItemDTO updateItem(Long id, ItemDTO itemDTO) {
        Item item = itemRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(ITEM_NOT_FOUND_MSG));

        if (itemDTO.getStockQuantity() < 0 || itemDTO.getMinStock() < 0) {
            throw new RuntimeException("El stock y el stock mínimo no pueden ser valores negativos");
        }

        if (itemDTO.getCategoryId() == null) {
        throw new RuntimeException("El artículo debe tener una categoría asignada");
    }

        boolean isAdmin = getContextRole().equals("ROLE_ADMIN");
        boolean isStaff = getContextRole().equals("ROLE_STAFF");

        if (isAdmin) {
            // Solo el ADMIN puede cambiar el nombre y validamos unicidad
            if (!item.getName().equals(itemDTO.getName())) {
                if (itemRepository.existsByNameAndDeletedAtIsNull(itemDTO.getName())) {
                    throw new RuntimeException("El nombre de artículo ya existe");
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
                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
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
                .orElseThrow(() -> new RuntimeException(ITEM_NOT_FOUND_MSG));

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
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .iterator().next().getAuthority();
    }

    private void checkAdminRole() {
        if (!getContextRole().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Acceso denegado: Se requieren permisos de administrador");
        }
    }
}
