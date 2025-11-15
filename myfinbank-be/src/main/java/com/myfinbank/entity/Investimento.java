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
@Table(name = "INVESTIMENTI")
public class Investimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "IDENTIFICATIVO", nullable = false)
    private String identificativo;

    @Column(name = "TIPO_INVESTIMENTO", nullable = false)
    private String tipoInvestimento;

    @Column(name = "IMPORTO_INVESTITO", nullable = false)
    private BigDecimal importoInvestito;

    @Column(name = "TASSO_PREVISTO", nullable = false)
    private BigDecimal tassoRitornoPrevisto; // es. 5% annuo

    @Column(name = "STATO_INVESTIMENTO", nullable = false)
    private String statoInvestimento;

    @Column(name = "DATA_INIZIO", nullable = false)
    private LocalDateTime dataInizio;

    @Column(name = "DATA_FINE", nullable = false)
    private LocalDateTime dataFine;

    @Column(name = "DURATA_MESI", nullable = false)
    private int mesi;

    @Column(name = "PREZZO_INGRESSO")
    private BigDecimal prezzoIngresso;

    @Column(name = "QUANTITA")
    private BigDecimal quantita;

    @Column(name = "SIMBOLO_MERCATO", nullable = false)
    private String simboloMercato;
}
