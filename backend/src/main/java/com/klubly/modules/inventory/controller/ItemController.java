package com.klubly.modules.inventory.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.klubly.modules.inventory.dto.ItemDTO;
import com.klubly.modules.inventory.service.ItemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inventory/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    // LECTURA

    @GetMapping
    public ResponseEntity<List<ItemDTO>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllActiveItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    //HISTORIAL DE AUDITORÍA (Solo Admin)

    @GetMapping("/history/deleted")
    public ResponseEntity<List<ItemDTO>> getDeletedHistory() {
        // El service se encarga de checkAdminRole()
        return ResponseEntity.ok(itemService.getAllDeletedItems());
    }

    //ESCRITURA

    @PostMapping
    public ResponseEntity<ItemDTO> createItem(@RequestBody ItemDTO itemDTO) {
        ItemDTO created = itemService.createItem(itemDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> updateItem(
            @PathVariable Long id, 
            @RequestBody ItemDTO itemDTO) {
        return ResponseEntity.ok(itemService.updateItem(id, itemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}