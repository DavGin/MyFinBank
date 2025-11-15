package com.myfinbank.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "CONTI")
public class Conto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ID", nullable = false)
  private Long id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "USER_ID", nullable = false)
  private User user;

  @Size(max = 150)
  @Column(name = "NUMERO_CONTO", length = 150)
  private String numeroConto;

  @Size(max = 150)
  @Column(name = "IBAN", length = 150)
  private String iban;

  @Size(max = 50)
  @Column(name = "TIPO", length = 50)
  private String tipo;

  @Size(max = 10)
  @Column(name = "VALUTA", length = 10)
  private String valuta;

  @ColumnDefault("CURRENT_TIMESTAMP")
  @Column(name = "DATA_CREAZIONE")
  private LocalDateTime dataCreation = LocalDateTime.now();

  @Column(name = "DATA_CHIUSURA")
  private LocalDateTime dataChiusura;


    @Column(name = "SALDO_CONTABILE")
    private BigDecimal saldoContabile;

    @Column(name = "ULTIMO_AGGIORNAMENTO")
    private LocalDateTime ultimoAggiornamento;

    @ColumnDefault("0")
    @Column(name = "SALDO_DISPONIBILE", precision = 19, scale = 2)
    private BigDecimal saldoDisponibile;

}
