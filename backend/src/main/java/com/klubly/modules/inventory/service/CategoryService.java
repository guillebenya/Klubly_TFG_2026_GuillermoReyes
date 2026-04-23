package com.klubly.modules.inventory.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klubly.modules.inventory.dto.CategoryDTO;
import com.klubly.modules.inventory.entity.Category;
import com.klubly.modules.inventory.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private static final String CATEGORY_NOT_FOUND_MSG = "Categoría no encontrada";

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllActiveCategories() {
        return categoryRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllDeletedCategories() {
        checkAdminRole();
        return categoryRepository.findByDeletedAtIsNotNull()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND_MSG));
        return convertToDTO(category);
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryByName(String name) {
        Category category = categoryRepository.findByNameAndDeletedAtIsNull(name)
                .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND_MSG));
        return convertToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        checkAdminRole();
        if (categoryRepository.existsByNameAndDeletedAtIsNull(categoryDTO.getName())) {
            throw new RuntimeException("El nombre de categoría ya existe");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setActive(true);

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        checkAdminRole();
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND_MSG));

        String role = getContextRole();
        if (!role.equals("ROLE_ADMIN")){
            categoryDTO.setActive(category.getActive());
        }

        if (!category.getName().equals(categoryDTO.getName()) &&
                categoryRepository.existsByNameAndDeletedAtIsNull(categoryDTO.getName())) {
            throw new RuntimeException("El nombre de categoría ya existe");
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        if (categoryDTO.getActive() != null) {
            category.setActive(categoryDTO.getActive());
        }

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        checkAdminRole();
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND_MSG));
        
        //No borrar si tiene artículos activos
        long activeItems = category.getItems().stream()
                .filter(item -> item.getDeletedAt() == null)
                .count();
        
        if (activeItems > 0) {
            throw new RuntimeException("No se puede eliminar una categoría que tiene artículos asociados");
        }

        category.setDeletedAt(java.time.LocalDateTime.now());
        category.setActive(false);
        categoryRepository.save(category);
    }
    
    //Método de conversión
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setActive(category.getActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setDeletedAt(category.getDeletedAt());
        if (category.getItems() != null) {
            int count = (int) category.getItems().stream()
                    .filter(item -> item.getDeletedAt() == null)
                    .count();
            dto.setItemCount(count);
        } else {
            dto.setItemCount(0);
        }
        return dto;
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
