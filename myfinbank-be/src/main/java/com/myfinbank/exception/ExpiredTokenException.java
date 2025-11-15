package com.myfinbank.exception;

import org.springframework.security.core.AuthenticationException;

public class ExpiredTokenException extends AuthenticationException {
    public ExpiredTokenException(String msg) {
        super(msg);
    }
}
