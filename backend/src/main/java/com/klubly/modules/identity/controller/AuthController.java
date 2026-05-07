package com.klubly.modules.identity.controller;

import com.klubly.common.security.JwtTokenProvider;
import com.klubly.core.exception.ResourceNotFoundException;
import com.klubly.modules.identity.dto.JwtAuthResponse;
import com.klubly.modules.identity.dto.LoginDto;
import com.klubly.modules.identity.dto.RegisterDTO;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.UserRepository;
import com.klubly.modules.identity.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder; // Necesario para la pass
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository; 
    private final PasswordEncoder passwordEncoder; 

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginDto loginDto){

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.username(), loginDto.password()
        ));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameAndDeletedAtIsNull(loginDto.username())
            .orElseThrow(() -> new ResourceNotFoundException("Error: Usuario no encontrado tras login"));

        List<Long> teamIds = user.getAffiliations().stream()
                .map(affiliation -> affiliation.getTeam().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtAuthResponse(user.getId(),
            token, 
            "Bearer", 
            user.getUsername(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().getName(), 
            user.getAvatarURL(),
            teamIds 
        ));
    }

    @PostMapping("/register")
@Transactional
public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
    // Creamos la instancia de la entidad y mapeamos los datos del DTO
    User user = new User();
    user.setUsername(registerDTO.username());
    user.setEmail(registerDTO.email());
    user.setPassword(passwordEncoder.encode(registerDTO.password()));
    user.setFirstName(registerDTO.firstName());
    user.setLastName(registerDTO.lastName());
    user.setPhone(registerDTO.phone());
    user.setAvatarURL(registerDTO.avatarURL());
    user.setIsPending(true);
    
    // Seguridad: Siempre inactivo y siempre rol de Socio
    user.setActive(false);
    user.setRole(roleRepository.findById(3L)
        .orElseThrow(() -> new ResourceNotFoundException("Error: Rol por defecto no encontrado")));

    userRepository.save(user);
    return ResponseEntity.ok().build();
}
}