package com.resell.backend.config;

import com.resell.backend.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // 1. CORS: Enable Cross-Origin Resource Sharing so the frontend can call us
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF: Disable Cross-Site Request Forgery because we use stateless JWTs,
                // not sessions
                .csrf(csrf -> csrf.disable())

                // 3. Authorization Rules: Define which pages are public vs private
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/auth/register").permitAll() // Public access
                        .anyRequest().authenticated()) // All other requests require login

                // 4. Session Management: Make it STATELESS (Server doesn't remember users, they
                // must send token every time)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 5. Add our custom JWT Filter before the standard Username/Password check
        // This checks if the user sent a valid token BEFORE trying to log them in.
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Use BCrypt to securely hash passwords
    }

    // Bean to define the CORS rules specifically for Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from these frontend URLs
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000",
                "http://localhost", "http://localhost:80", "http://127.0.0.1", "http://127.0.0.1:80"));

        // Allow these HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers (like 'Authorization', 'Content-Type')
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, auth headers)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply to all paths
        return source;
    }

}
