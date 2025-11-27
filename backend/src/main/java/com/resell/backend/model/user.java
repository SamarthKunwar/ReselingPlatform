package com.resell.backend.model;
import java.lang.annotation.Inherited;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name="users")
@Data
@NoArgsConstructor     
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullname;
    
}
