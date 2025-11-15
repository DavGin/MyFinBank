package com.myfinbank.repository;

import com.myfinbank.entity.Finanziamento;
import com.myfinbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinanziamentoRepository extends JpaRepository<Finanziamento, Long> {

    List<Finanziamento> findByUser(User user);

    Finanziamento findByNumeroPratica(String numeroPratica);

    List<Finanziamento> findByStato(String name);
}
