package com.myfinbank.repository;

import com.myfinbank.entity.Carta;
import com.myfinbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartaRepository extends JpaRepository<Carta, Long> {
    List<Carta> findByUser(User user);

    Carta findByNumeroCarta(String numeroCarta);
}
