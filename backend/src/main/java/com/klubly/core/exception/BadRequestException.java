package com.klubly.core.exception;

// Esta excepción nos servirá para errores de lógica (Importe negativo, plazas agotadas...)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}