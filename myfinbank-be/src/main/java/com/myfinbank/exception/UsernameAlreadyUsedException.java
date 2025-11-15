package com.myfinbank.exception;


public class UsernameAlreadyUsedException extends RuntimeException {
    public UsernameAlreadyUsedException(String messageKey) {
        super(messageKey);
    }
}