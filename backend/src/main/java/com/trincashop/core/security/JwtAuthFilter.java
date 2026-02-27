package com.trincashop.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final HandlerExceptionResolver resolver;

    public JwtAuthFilter(JwtUtil jwtUtil,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.jwtUtil = jwtUtil;
        this.resolver = resolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Se não há token, passa adiante (o Spring Security decidirá o acesso)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);

            if (jwtUtil.isBlacklisted(token)) {
                // Ao lançar a exceção, o fluxo vai pro catch lá embaixo que repassa ao resolver
                // (401 global)
                throw new IllegalArgumentException("Token revogado permanentemente (invalidado via logout)");
            }

            final String email = jwtUtil.extractEmail(token);

            // Só autentica se ainda não há autenticação no contexto
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Em vez de ir no banco, lemos as roles do próprio token
                if (jwtUtil.validateToken(token, email)) {
                    java.util.List<String> roles = jwtUtil.extractRoles(token);

                    java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = roles
                            .stream()
                            .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                            .collect(java.util.stream.Collectors.toList());

                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            email, "", authorities); // Senha vazia pois já autenticamos via token

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            // Delega a exceção para o HandlerExceptionResolver para que caia no
            // GlobalExceptionHandler ou retorne erro formatado
            resolver.resolveException(request, response, null, e);
        }
    }
}
