package com.myfinbank.exception;

public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException(String messageKey) {
        super(messageKey);
    }
}