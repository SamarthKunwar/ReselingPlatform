package com.resell.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.resell.backend.model.Item;
import com.resell.backend.model.User;
import com.resell.backend.repository.ItemRepository;
import com.resell.backend.repository.UserRepository;
import com.resell.backend.security.JwtUtil;

@RestController
@RequestMapping("/items")
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
        return itemRepository.findByPurchasedFalse();
    }

    // Get item by id
    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    @GetMapping("/my")
    public List<Item> getMyItems(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7); // remove "Bearer "
        String email = jwtUtil.extractEmail(jwt);
        return userRepository.findByEmail(email)
                .map(user -> itemRepository.findByOwnerId(user.getId()))
                .orElse(List.of());
    }

    // Add item
    @PostMapping
    public Item addItem(@RequestBody Item item, @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        item.setOwner(user);
        if (item.getPurchased() == null) {
            item.setPurchased(false);
        }
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

    @Autowired
    private com.resell.backend.service.StorageService storageService;

    @PostMapping("/upload")
    public org.springframework.http.ResponseEntity<java.util.Map<String, String>> uploadFile(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileUrl = storageService.uploadFile(file);
            return org.springframework.http.ResponseEntity.ok(java.util.Map.of("url", fileUrl));
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError()
                    .body(java.util.Map.of("error", "Failed to upload file"));
        }
    }

}
