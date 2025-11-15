package com.myfinbank.repository;

import com.myfinbank.entity.Conto;
import com.myfinbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;


public interface ContoRepository extends JpaRepository<Conto, Long> {

    List<Conto> findByUser(User user);

    Conto findByNumeroConto(String numeroConto);

    Conto findByIban(String targetIban);

    String numeroConto(String numeroConto);
}
