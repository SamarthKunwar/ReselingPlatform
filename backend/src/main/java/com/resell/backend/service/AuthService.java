package com.resell.backend.service;

import com.resell.backend.model.User;
import com.resell.backend.repository.UserRepository;
import com.resell.backend.security.JwtUtil;

import org.springframework.stereotype.Service;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Service
public class AuthService {


    @Autowired
    private UserRepository userRepository;//to access users in the database

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; //to hash and check passwords

    @Autowired 
    private JwtUtil jwtUtil;  //to generate JWT tokens

////////////////////////////////////////////////////////////////////////////////////////////
    public User registerUser(User user)
    {
            // 1. Get and Hash the password
        String hashedPassword = passwordEncoder.encode(user.getPassword());

        // 2. Set the hashed password in user object
        user.setPassword(hashedPassword);

        // 3. Save user to database
        return userRepository.save(user);

    }
/////////////////////////////validate credentials and return JWT token///////////////////    
    public String loginUser(String email, String password) throws Exception 
    {

        // 1. Find user by email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            throw new Exception("User not found");
        }

        User user = optionalUser.get();

        // 2. Check if password matches
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid credentials");
        }

        // 3. Generate JWT token
        String token = jwtUtil.generateToken(user.getFirstname());

        return token;
    }

    ////////////////////////Useful for controllers that need the current user///////////////////
    public User getUserByEmail(String email) throws Exception
    {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("User not found"));
    }


   
}