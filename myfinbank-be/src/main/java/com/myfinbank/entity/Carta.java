package com.myfinbank.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.myfinbank.utils.YearMonthAttributeConverter;
import com.myfinbank.utils.YearMonthDeserializerMMYY;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Getter
@Setter
@Entity
@Table(name = "CARTE")
public class Carta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CONTO_ID")
    private Conto conto;

    @Size(max = 16)
    @NotNull
    @Column(name = "NUMERO_CARTA", nullable = false, unique = true, length = 16)
    private String numeroCarta;

    @Size(max = 4)
    @NotNull
    @Column(name = "CVV", nullable = false, length = 4)
    private String cvv;

    @NotNull
    @Column(name = "DATA_SCADENZA", nullable = false)
    @JsonDeserialize(using = YearMonthDeserializerMMYY.class)
    @Convert(converter = YearMonthAttributeConverter.class) // per JPA
    private YearMonth dataScadenza;

    @Size(max = 50)
    @Column(name = "CIRCUITO", length = 50) // VISA, Mastercard, ecc.
    private String circuito;

    @Column(name = "TIPO") // DEBITO, CREDITO, PREPAGATA
    private String tipo;

    @Column(name = "LIMITE_GIORNALIERO", precision = 19, scale = 2)
    private BigDecimal limiteGiornaliero;

    @Column(name = "LIMITE_MENSILE", precision = 19, scale = 2)
    private BigDecimal limiteMensile;

    @Column(name = "DATA_CREAZIONE", nullable = false)
    private LocalDateTime dataCreazione = LocalDateTime.now();

    @Column(name = "SALDO_CARTA", precision = 19, scale = 2)
    private BigDecimal saldoCarta;

    @Column(name = "PLAFOND", precision = 19, scale = 2)
    private BigDecimal plafond;

    @Column(name = "STATO")
    private String stato; // ATTIVA, BLOCCATA, SCADUTA

    @Column(name = "ULTIMO_UTILIZZO")
    private LocalDateTime ultimoUtilizzo;

    @Size(max = 6)
    @NotNull
    @Column(name = "PIN", nullable = false, length = 6)
    private String pin;

}
