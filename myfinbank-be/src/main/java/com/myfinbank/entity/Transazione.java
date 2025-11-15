package com.myfinbank.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "TRANSAZIONI")
public class Transazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CONTO_ID", nullable = false)
    private Conto conto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RATA_ID")
    private RateCalcolate rata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CARTA_ID")
    private Carta carta;

    @Column(name = "TIPO_TRANSAZIONE", nullable = false)
    private String tipoTransazione;

    @Column(name = "IMPORTO", nullable = false)
    private BigDecimal importo;

    @Column(name = "VALUTA", nullable = false)
    private String valuta;

    @Column(name = "DATA_TRANSAZIONE", nullable = false)
    private LocalDateTime dataTransazione = LocalDateTime.now();

    @Column(name = "DATA_CONTABILE", nullable = false)
    private LocalDateTime dataContabile;

    @Column(name = "DESCRIZIONE", nullable = false)
    private String descrizione;

    @Column(name = "CATEGORIA", nullable = false)
    private String categoria;


    @Column(name = "DIREZIONE", nullable = false)
    private String direzione;

    @Size(max = 20)
    @Column(name = "STATO", length = 20)
    private String stato;

}
