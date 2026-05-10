package com.klubly.core.exception;

//Esta excepción sirve para problemas de permisos
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}