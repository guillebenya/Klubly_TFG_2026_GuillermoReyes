package com.klubly.core.exception;

//Esta excepción nos servirá para problemas de permisos
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}