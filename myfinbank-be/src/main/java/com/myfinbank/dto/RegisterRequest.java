package com.myfinbank.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class RegisterRequest {

    @Pattern(
            regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "Inserire un'email valida"
    )
    @NotNull
    private String email;

    @NotNull(message = "La password è obbligatoria")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "La password deve contenere almeno 8 caratteri, una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale"
    )
    private String password;

    @NotNull(message = "Il nome è obbligatorio")
    @Size(max = 50, message = "Il nome non può superare i 50 caratteri")
    private String nome;

    @NotNull(message = "Il cognome è obbligatorio")
    @Size(max = 50, message = "Il cognome non può superare i 50 caratteri")
    private String cognome;

    @NotNull(message = "Username è obbligatorio")
    @Size(max = 50, message = "Username non può superare i 10 caratteri")
    private String username;


    @NotNull(message = "Il codice fiscale è obbligatorio")
    @Pattern(
            regexp = "^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$",
            message = "Il codice fiscale deve essere valido e rispettare il formato standard"
    )
    private String codiceFiscale;

    @NotNull(message = "La data di nascita è obbligatoria")
    @Past(message = "La data di nascita deve essere passata")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate dataNascita;

    private String ruolo;

    private LocalDateTime createdAt;

    private String stato;

    private LocalDate ultimoAccesso;


}
