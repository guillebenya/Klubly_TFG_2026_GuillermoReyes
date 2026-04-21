package com.klubly.modules.identity.controller;

import com.klubly.common.security.JwtTokenProvider;
import com.klubly.modules.identity.dto.JwtAuthResponse;
import com.klubly.modules.identity.dto.LoginDto;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto){

        //Validar las credenciales
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.username(), loginDto.password()
        ));

        //Guardar al usuario en el contexto de seguridad
        SecurityContextHolder.getContext().setAuthentication(authentication);

        //Generar el Token
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameAndDeletedAtIsNull(loginDto.username())
            .orElseThrow(() -> new RuntimeException("Error: Usuario no encontrado tras login"));

        // Obtenemos los IDs de los equipos desde las afiliaciones del usuario
        List<Long> teamIds = user.getAffiliations().stream()
                .map(affiliation -> affiliation.getTeam().getId())
                .collect(Collectors.toList());

        //Devolver el DTO con el token
        return ResponseEntity.ok(new JwtAuthResponse(
            token, 
            "Bearer", 
            user.getUsername(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().getName(), // Sacamos el nombre del rol (ADMIN, STAFF, etc)
            user.getAvatarURL(),
            teamIds // Sacamos la lista de IDs de los equipos a los que el usuario está afiliado
    ));
    }
}
