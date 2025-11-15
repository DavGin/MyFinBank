package com.myfinbank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRequest {


    @NotBlank
    private String identifier;

    @NotBlank
    private String password;

}
