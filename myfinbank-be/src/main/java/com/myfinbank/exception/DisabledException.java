package com.myfinbank.exception;

public class DisabledException extends RuntimeException {
    public DisabledException(String messageKey) {
        super(messageKey);
    }
}
