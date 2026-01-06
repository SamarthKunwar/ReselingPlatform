package com.resell.backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException {

        // STEP A — Read header
        String authHeader = request.getHeader("Authorization");

        try {
            // STEP B — Check if token exists and starts with "Bearer "
            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                // Remove first 7 characters of "Bearer ":
                String token = authHeader.substring(7);

                // STEP C — Extract username from token
                String username = jwtUtil.extractUsername(token);

                // STEP C.1 — Check if user is not already authenticated
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // STEP D — Load user details
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    // STEP E — Validate token
                    if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                        // STEP F — Build authentication object
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                        // STEP G — Set in SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            // Log the error but allows the request to continue (e.g., to public endpoints)
            // System.out.println("JWT Validation failed: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        // STEP H — Continue filter chain
        filterChain.doFilter(request, response);
    }

}
