package com.myfinbank.repository;

import com.myfinbank.entity.Investimento;
import com.myfinbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvestimentoRepository extends JpaRepository <Investimento, Long>{
    List<Investimento> findByUser(User user);

    Optional<Investimento> findByIdentificativo(String identificativo);
}
