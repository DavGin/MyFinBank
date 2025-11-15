package com.myfinbank.repository;

import com.myfinbank.entity.Carta;
import com.myfinbank.entity.Conto;
import com.myfinbank.entity.Transazione;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransazioneRepository extends JpaRepository<Transazione, Long> {
    Page<Transazione> findByConto(Conto conto, Pageable pageable);
    Page<Transazione> findByCarta(Carta carta, Pageable pageable);

    List<Transazione> findByConto(Conto conto);
    Optional<Transazione> findById(Long id);

    @Query("SELECT t FROM Transazione t WHERE t.stato = 'IN_ATTESA' AND t.dataTransazione <= :threshold")
    List<Transazione> findTransazioniInAttesaOlderThan(LocalDateTime threshold);

    boolean existsByRataIdAndStato(Long id, String name);

    List<Transazione> findByCarta(Carta carta);
}
