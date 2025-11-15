package com.myfinbank.dto;

import com.myfinbank.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserProfileDto {

    private Long id;
    private String username;
    private String email;
    private String nome;
    private String cognome;
    private String password;
    private String codiceFiscale;
    private LocalDate dataNascita;
    private String ruolo;
    private LocalDateTime ultimoAccesso;


    public static UserProfileDto fromEntity(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPassword(user.getPassword());
        dto.setEmail(user.getEmail());
        dto.setNome(user.getNome());
        dto.setCognome(user.getCognome());
        dto.setRuolo(user.getRuolo());
        dto.setCodiceFiscale(user.getCodiceFiscale());
        dto.setDataNascita(user.getDataNascita());
        dto.setUltimoAccesso(user.getUltimoAccesso());
        return dto;
    }

}
