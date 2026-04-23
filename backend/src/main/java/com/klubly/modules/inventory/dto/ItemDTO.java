package com.klubly.modules.inventory.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ItemDTO {
    private Long id;
    private String name;
    private String description;
    private int stockQuantity;
    private int minStock;
    private String location;

    private Long categoryId;
    private String categoryName;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    
}
