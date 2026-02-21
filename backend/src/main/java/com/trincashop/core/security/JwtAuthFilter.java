package com.trincashop.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Aplica o filtro apenas para as rotas admin, ignorando preflight OPTIONS
        if (path.startsWith("/api/admin/") && !request.getMethod().equalsIgnoreCase("OPTIONS")) {
            String authorizationHeader = request.getHeader("Authorization");

            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                if (jwtUtil.validateToken(token)) {
                    // Token válido, continua a requisição
                    filterChain.doFilter(request, response);
                    return;
                }
            }

            // Sem token ou token inválido
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"erro\": \"Não autorizado. Token inválido ou ausente.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
