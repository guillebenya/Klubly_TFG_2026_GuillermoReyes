package com.klubly.modules.identity.controller;

import com.klubly.common.security.JwtTokenProvider;
import com.klubly.modules.identity.dto.JwtAuthResponse;
import com.klubly.modules.identity.dto.LoginDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto){

        //Validar las credenciales
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.username(), loginDto.password()
        ));

        //Guardar al usuario en el contexto de seguridad
        SecurityContextHolder.getContext().setAuthentication(authentication);

        //Generar el Token
        String token = tokenProvider.generateToken(authentication);

        //Devolver el DTO con el token
        return ResponseEntity.ok(new JwtAuthResponse(token, "Bearer"));
    }
}
