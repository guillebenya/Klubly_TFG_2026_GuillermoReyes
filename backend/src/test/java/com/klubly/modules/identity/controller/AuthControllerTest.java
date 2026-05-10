package com.klubly.modules.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klubly.common.security.JwtTokenProvider;
import com.klubly.modules.identity.dto.LoginDto;
import com.klubly.modules.identity.dto.RegisterDTO;
import com.klubly.modules.identity.entity.Role;
import com.klubly.modules.identity.entity.User;
import com.klubly.modules.identity.repository.RoleRepository;
import com.klubly.modules.identity.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class) // JUnit 5 + Mockito (Sin contexto de Spring = Cero problemas)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    private User testUser;
    private Role memberRole;

    @BeforeEach
    void setUp() {
        // Configuramos MockMvc manualmente con el controlador y sus mocks
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();

        memberRole = new Role();
        memberRole.setName("MEMBER");
        memberRole.setId(3L);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("guillermo");
        testUser.setFirstName("Guillermo");
        testUser.setLastName("Reyes");
        testUser.setRole(memberRole);
        testUser.setAffiliations(new ArrayList<>());
    }

    @Test
    @DisplayName("Login exitoso debería devolver el token y datos del usuario")
    void loginShouldReturnJwtAuthResponse() throws Exception {
        LoginDto loginDto = new LoginDto("guillermo", "password123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked-jwt-token");
        when(userRepository.findByUsernameAndDeletedAtIsNull("guillermo"))
                .thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"))
                .andExpect(jsonPath("$.username").value("guillermo"));
    }

    @Test
    @DisplayName("Registro exitoso debería devolver 200 OK")
    void registerShouldReturnOk() throws Exception {
        RegisterDTO registerDto = new RegisterDTO(
                "nuevo.socio", "test@test.com", "pass123", "Juan", "Perez", "600000000", null
        );

        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");
        when(roleRepository.findById(3L)).thenReturn(Optional.of(memberRole));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isOk());
    }
}