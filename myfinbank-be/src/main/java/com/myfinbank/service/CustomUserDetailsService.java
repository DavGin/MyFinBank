package com.myfinbank.service;

import com.myfinbank.entity.User;
import com.myfinbank.repository.UserRepository;
import com.myfinbank.utils.UserStato;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public CustomUserDetailsService(UserRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username);
        if(user == null) throw new UsernameNotFoundException(username);
        if (user.getRuolo() == null) {
            throw new IllegalStateException("L'utente non ha ruoli associati.");
        }

        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(user.getRuolo())
        );

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities) // Ruoli
                .disabled(!user.getStato().equals(UserStato.ATTIVO.name())) // Controlla se è disabilitato
                .build();
    }



}
