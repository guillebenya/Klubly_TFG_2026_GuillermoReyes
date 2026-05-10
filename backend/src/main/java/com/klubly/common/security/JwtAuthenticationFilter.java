package com.klubly.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String token = getTokenFromRequest(request);

            if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
                String username = tokenProvider.getUsername(token);
                
                // Aquí es donde "explotaba" antes si el usuario no existía
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
            
            filterChain.doFilter(request, response);

        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            // Si el usuario del token ya no existe (por un reset de DB), enviamos 401
            logger.error("Usuario no encontrado en la base de datos: " + e.getMessage());
            handleAuthenticationError(response, "El usuario asociado al token ya no existe.");
        } catch (Exception e) {
            // Para cualquier otro error de autenticación
            logger.error("Error en la autenticación JWT: " + e.getMessage());
            handleAuthenticationError(response, "Token inválido o expirado.");
        }
    }

// Método auxiliar para escribir la respuesta 401 en formato JSON
private void handleAuthenticationError(HttpServletResponse response, String message) throws IOException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write(String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", message));
}

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}