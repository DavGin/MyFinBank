package com.myfinbank.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "USERS")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "EMAIL", nullable = false)
    private String email;

    @Size(max = 255)
    @NotNull
    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Size(max = 100)
    @Column(name = "NOME", length = 100)
    private String nome;

    @Size(max = 100)
    @Column(name = "COGNOME", length = 100)
    private String cognome;

    @Size(max = 100)
    @Column(name = "CODICE_FISCALE", length = 100)
    private String codiceFiscale;

    @Column(name = "DATA_NASCITA")
    private LocalDate dataNascita;

    @Column(name = "RUOLO")
    private String ruolo;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Size(max = 100)
    @NotNull
    @Column(name = "USERNAME", nullable = false, length = 100)
    private String username;

    @Size(max = 20)
    @NotNull
    @Column(name = "STATO", nullable = false, length = 20)
    private String stato;

    @NotNull
    @Column(name = "ULTIMO_ACCESSO", nullable = false)
    private LocalDateTime ultimoAccesso;


}
