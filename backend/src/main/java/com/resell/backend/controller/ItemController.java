package com.resell.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.resell.backend.model.Item;
import com.resell.backend.model.User;
import com.resell.backend.repository.ItemRepository;
import com.resell.backend.repository.UserRepository;
import com.resell.backend.security.JwtUtil;

public class ItemController {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository; // to get user info

    @Autowired
    private JwtUtil jwtUtil;

    // Get all items
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Get item by id
    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    @GetMapping("/my")
    public List<Item> getMyItems(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7); // remove "Bearer "
        String email = jwtUtil.extractEmail(jwt); // assume your JwtUtil can extract email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return List.of(); // empty list if user not found
        }
        User user = optionalUser.get();
        return itemRepository.findByOwnerId(user.getId());
    }

    // Add item
    @PostMapping
    public Item addItem(@RequestBody Item item) {
        return itemRepository.save(item);
    }

    // Update item
    @PutMapping("/{id}")
    public Item updateItem(@PathVariable Long id, @RequestBody Item item) {
        item.setId(id);
        return itemRepository.save(item);
    }

    // Delete item
    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemRepository.deleteById(id);
    }

}
