package com.myfinbank.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordUpdateRequest {

    private String oldPassword;
    private String newPassword;
}
