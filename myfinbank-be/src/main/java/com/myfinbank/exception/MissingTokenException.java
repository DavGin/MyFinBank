package com.myfinbank.exception;

import org.springframework.security.core.AuthenticationException;

public class MissingTokenException extends AuthenticationException {
    public MissingTokenException(String message) {
        super(message);
    }
}
