package com.myfinbank.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "FINANZIAMENTI")
public class Finanziamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "NUMERO_PRATICA", nullable = false, unique = true, length = 10)
    private String numeroPratica;

    @Column(name = "IMPORTO_RICHIESTO", nullable = false)
    private BigDecimal importoRichiesto;

    @Column(name = "IMPORTO_TOTALE", nullable = false)
    private BigDecimal importoTotale;

    @Column(name = "DURATA_MESI", nullable = false)
    private int durataMesi;

    @Column(name = "TASSO_INTERESSE", nullable = false)
    private BigDecimal tassoInteresse;

    @Column(name = "DATA_CREAZIONE", nullable = false)
    private LocalDateTime dataCreazione = LocalDateTime.now();

    @Column(name = "DATA_CHIUSURA", nullable = false)
    private LocalDateTime dataChiusura;

    @Column(name = "MOTIVO_FINANZIAMENTO")
    private String motivoFinanziamento;

    @Column(name = "STATO", nullable = false)
    private String stato;

    @Column(name = "MOTIVO_RIFIUTO")
    private String motivoRifiuto;


}
