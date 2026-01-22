package com.resell.backend.security;

import com.resell.backend.model.User;
import com.resell.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${INITIAL_ADMIN_EMAIL:}")
    private String initialAdminEmail;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (initialAdminEmail != null && !initialAdminEmail.isEmpty() &&
                initialAdminEmail.equalsIgnoreCase(user.getEmail()) &&
                !"ROLE_ADMIN".equals(user.getRole())) {
            System.out.println("DEBUG: Promoting user to ROLE_ADMIN: " + user.getEmail());
            user.setRole("ROLE_ADMIN");
            userRepository.save(user);
            System.out.println("DEBUG: User saved with ROLE_ADMIN");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();
    }
}
