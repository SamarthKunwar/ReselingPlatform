package com.resell.backend.controller;

import com.resell.backend.dto.CartDTO;
import com.resell.backend.dto.CartItemDTO;
import com.resell.backend.dto.ItemDTO;
import com.resell.backend.model.Cart;
import com.resell.backend.model.CartItem;
import com.resell.backend.model.Item;
import com.resell.backend.model.User;
import com.resell.backend.repository.CartRepository;
import com.resell.backend.repository.CartItemRepository;
import com.resell.backend.repository.ItemRepository;
import com.resell.backend.repository.UserRepository;
import com.resell.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Get current user's cart
    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create a new cart if user doesn't have one
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Convert to DTO to properly serialize item details
        CartDTO cartDTO = CartDTO.builder()
                .id(cart.getId())
                .items(cart.getItems().stream()
                        .map(cartItem -> CartItemDTO.builder()
                                .id(cartItem.getId())
                                .item(ItemDTO.builder()
                                        .id(cartItem.getItem().getId())
                                        .title(cartItem.getItem().getTitle())
                                        .description(cartItem.getItem().getDescription())
                                        .price(cartItem.getItem().getPrice())
                                        .imageUrl(cartItem.getItem().getImageUrl())
                                        .build())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        return ResponseEntity.ok(cartDTO);
    }

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Long> request) {

        User user = getUserFromToken(token);
        Long itemId = request.get("itemId");

        // Find or create cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Find the item
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Create cart item
        CartItem cartItem = CartItem.builder()
                .cart(cart)
                .item(item)
                .build();

        cartItemRepository.save(cartItem);

        return ResponseEntity.ok(Map.of("message", "Item added to cart"));
    }

    // Remove item from cart
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @RequestHeader("Authorization") String token,
            @PathVariable Long cartItemId) {

        User user = getUserFromToken(token);

        // Verify the cart item belongs to the user's cart
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        cartItemRepository.delete(cartItem);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    // Checkout - clear cart (simplified, no payment processing)
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        // Clear all items from cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of("message", "Checkout successful!"));
    }

    // Helper method to extract user from JWT token
    private User getUserFromToken(String token) {
        String jwt = token.substring(7); // Remove "Bearer "
        String email = jwtUtil.extractEmail(jwt);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
