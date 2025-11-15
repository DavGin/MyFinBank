package com.myfinbank.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProfileUpdateRequest {

    private String username;
    private String email;
    private String nome;
    private String cognome;
    private String codiceFiscale;
    private LocalDate dataNascita;

}
