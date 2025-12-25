package com.resell.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id") // Foreign key to carts table
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "item_id") // Foreign key to items table
    @JsonManagedReference // Prevents circular reference issues
    private Item item;
}
