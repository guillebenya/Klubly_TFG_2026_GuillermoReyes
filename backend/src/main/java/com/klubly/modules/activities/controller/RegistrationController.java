package com.klubly.modules.activities.controller;

import com.klubly.modules.activities.dto.RegistrationDTO;
import com.klubly.modules.activities.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    //GESTIÓN (ADMIN/STAFF)

    // Obtener todos los inscritos de una actividad
    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<RegistrationDTO>> getRegistrationsByActivity(@PathVariable Long activityId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByActivity(activityId));
    }

    // Inscripción manual de un usuario
    @PostMapping("/activity/{activityId}/user/{userId}")
    public ResponseEntity<RegistrationDTO> addRegistrationManual(
            @PathVariable Long activityId, 
            @PathVariable Long userId) {
        return new ResponseEntity<>(registrationService.addRegistrationManual(activityId, userId), HttpStatus.CREATED);
    }

    // Eliminar inscripción manual
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeRegistrationManual(@PathVariable Long id) {
        registrationService.removeRegistrationManual(id);
        return ResponseEntity.noContent().build();
    }

    //ACCIONES DEL SOCIO (MEMBER)

    // El usuario logueado se apunta a la actividad
    @PostMapping("/activity/{activityId}/self")
    public ResponseEntity<RegistrationDTO> registerSelf(@PathVariable Long activityId) {
        return new ResponseEntity<>(registrationService.registerCurrentUser(activityId), HttpStatus.CREATED);
    }

    // El usuario logueado se desapunta de la actividad
    @DeleteMapping("/activity/{activityId}/self")
    public ResponseEntity<Void> unregisterSelf(@PathVariable Long activityId) {
        registrationService.unregisterCurrentUser(activityId);
        return ResponseEntity.noContent().build();
    }
}