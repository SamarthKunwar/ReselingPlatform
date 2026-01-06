package com.resell.backend.controller;

import com.resell.backend.dto.LoginRequest;
import com.resell.backend.dto.RegisterRequest;
import com.resell.backend.model.User;
import com.resell.backend.repository.UserRepository;
import com.resell.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // 1. register()
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        System.out.println("DEBUG: Register endpoint hit");
        System.out.println("DEBUG: Email: " + request.getEmail());
        System.out.println("DEBUG: Firstname: " + request.getFirstname());
        System.out.println("DEBUG: Password: " + (request.getPassword() != null ? "***" : "null"));
        // Check if user with this email already exists
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        // Encode the password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Create user object
        User user = new User();
        user.setFullname(request.getFirstname() + " " + request.getLastname());
        user.setEmail(request.getEmail());
        user.setPassword(encodedPassword);

        // Save to database
        userRepo.save(user);

        // Return success response
        return ResponseEntity.ok("User registered successfully!");
    }

    // 2️⃣ Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            // Authenticate using AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(401)
                    .body("Error: Invalid email or password");
        }

        // Load user from database
        User user = userRepo.findByEmail(request.getEmail()).get();

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        // Return token + user info
        return ResponseEntity.ok(
                new LoginResponse(token, user.getFullname(), user.getEmail()));
    }

    // Inner class for login response
    private static class LoginResponse {
        private String token;
        private String username;
        private String email;

        public LoginResponse(String token, String username, String email) {
            this.token = token;
            this.username = username;
            this.email = email;
        }

        public String getToken() {
            return token;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }
    }
}
