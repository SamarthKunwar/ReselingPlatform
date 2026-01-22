package com.resell.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resell.backend.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {
     List<Item> findByOwnerId(Long owner);

     List<Item> findByPurchasedFalse();
}