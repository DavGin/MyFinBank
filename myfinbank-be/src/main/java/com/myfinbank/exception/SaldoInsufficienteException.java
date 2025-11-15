package com.myfinbank.exception;

public class SaldoInsufficienteException extends RuntimeException {
    public SaldoInsufficienteException(String message) {
        super(message);
    }
}
