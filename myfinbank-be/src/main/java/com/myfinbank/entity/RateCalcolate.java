package com.myfinbank.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "RATE_CALCOLATE")
public class RateCalcolate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "NUMERO_RATA", nullable = false)
    private int numeroRata;

    @NotNull
    @Column(name = "SCADENZA", nullable = false)
    private LocalDateTime scadenza;

    @NotNull
    @Column(name = "QUOTA_CAPITALE", nullable = false, precision = 15, scale = 2)
    private BigDecimal quotaCapitale;

    @NotNull
    @Column(name = "INTERESSI", nullable = false, precision = 15, scale = 2)
    private BigDecimal interessi;

    @NotNull
    @Column(name = "RATA_TOTALE", nullable = false, precision = 15, scale = 2)
    private BigDecimal rataTotale;

    @NotNull
    @Column(name = "SALDO_RIMANENTE", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoRimanente;

    @Size(max = 50)
    @NotNull
    @Column(name = "STATO_RATA", nullable = false, length = 50)
    private String statoRata;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "FINANZIAMENTO_ID", nullable = false)
    private Finanziamento finanziamento;

}
