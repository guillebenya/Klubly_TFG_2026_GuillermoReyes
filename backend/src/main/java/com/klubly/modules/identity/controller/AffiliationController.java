package com.klubly.modules.identity.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klubly.modules.identity.dto.AffiliationDTO;
import com.klubly.modules.identity.service.AffiliationService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/affiliations")
@RequiredArgsConstructor
public class AffiliationController {
    
    private final AffiliationService affiliationService;

    @GetMapping
    public ResponseEntity<List<AffiliationDTO>> getAll() {
        return ResponseEntity.ok(affiliationService.getAllActiveAffiliations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AffiliationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(affiliationService.getAffiliationById(id));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AffiliationDTO>> getByUserId(@PathVariable Long userId) {
        List<AffiliationDTO> affiliations = affiliationService.getAffiliationsByUserId(userId);
        return ResponseEntity.ok(affiliations);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<AffiliationDTO>> getByTeamId(@PathVariable Long teamId) {
        List<AffiliationDTO> affiliations = affiliationService.getAffiliationsByTeamId(teamId);
        return ResponseEntity.ok(affiliations);
    }

    @PostMapping
    public ResponseEntity<AffiliationDTO> create(@RequestBody AffiliationDTO affiliationDTO) {
        AffiliationDTO createdAffiliation = affiliationService.createAffiliation(affiliationDTO);
        return new ResponseEntity<>(createdAffiliation, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AffiliationDTO> update(@PathVariable Long id, @RequestBody AffiliationDTO affiliationDTO) {
        AffiliationDTO updatedAffiliation = affiliationService.updateAffiliation(id, affiliationDTO);
        return new ResponseEntity<>(updatedAffiliation, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        affiliationService.deleteAffiliation(id);
        return ResponseEntity.noContent().build();
    }

}
