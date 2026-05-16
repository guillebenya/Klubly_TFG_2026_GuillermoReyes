package com.klubly.common.config;

import com.klubly.common.security.JwtAuthenticationFilter;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@OpenAPIDefinition(
    info = @Info(
        title = "Klubly API",
        version = "1.0",
        description = "Documentación de los servicios backend de Klubly.",
        contact = @Contact(name = "Guillermo Reyes", email = "guillermo.reyes.gmz@gmail.com")
    ), security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
@Configuration
@RequiredArgsConstructor // Importante para que Spring inyecte el filtro automáticamente
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .cors(Customizer.withDefaults()) // Activa la configuración de WebConfig
            .csrf(csrf -> csrf.disable())    // // NOSONAR - Stateless JWT API: no session cookies, CSRF not applicable
            .exceptionHandling(exception -> exception
                // Fuerza el 401 cuando la autenticación falla
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(HttpStatus.UNAUTHORIZED.value(), "Sesión expirada o token inválido")
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // Permitir acceso a Swagger sin autenticación
                .requestMatchers("/api/auth/**").permitAll() // Login público
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/username/**").authenticated()
                .anyRequest().authenticated()                // Lo demás protegido
            )
            // Le decimos a Spring que no guarde sesiones (Stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        // Añadimos filtro JWT: Le decimos que pase el filtro antes que el de usuario/password estándar
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}