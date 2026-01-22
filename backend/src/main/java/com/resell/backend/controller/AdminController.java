package com.resell.backend.controller;

import com.resell.backend.model.Item;
import com.resell.backend.model.User;
import com.resell.backend.repository.ItemRepository;
import com.resell.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all items (including purchased)
    @GetMapping("/items")
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Delete any item
    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        itemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted by admin"));
    }

    // Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Toggle admin role for a user (useful for testing/initial setup)
    @PostMapping("/users/{id}/toggle-admin")
    public ResponseEntity<?> toggleAdmin(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ROLE_ADMIN".equals(user.getRole())) {
            user.setRole("ROLE_USER");
        } else {
            user.setRole("ROLE_ADMIN");
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("role", user.getRole()));
    }
}
