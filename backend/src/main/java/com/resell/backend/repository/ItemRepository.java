package main.java.com.resell.backend.repository;
import main.java.com.resell.backend.model.User;

import main.java.com.resell.backend.model.Item;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ItemRepository extends JpaRepository<User, Long> {
     List<Item> findByOwnerId(Long userId);
}