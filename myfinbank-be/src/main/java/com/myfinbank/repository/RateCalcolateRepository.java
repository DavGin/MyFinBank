package com.myfinbank.repository;

import com.myfinbank.entity.Finanziamento;
import com.myfinbank.entity.RateCalcolate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RateCalcolateRepository extends JpaRepository<RateCalcolate, Long> {

    // Cerca rate per stato specifico
    List<RateCalcolate> findByStatoRata(String statoRata);

    boolean existsByFinanziamentoAndNumeroRataAndStatoRata(Finanziamento fin, int i, String name);

    RateCalcolate findByFinanziamentoAndNumeroRata(Finanziamento fin, int numeroRata);

    List<RateCalcolate> findAllByFinanziamento(Finanziamento fin);
}
