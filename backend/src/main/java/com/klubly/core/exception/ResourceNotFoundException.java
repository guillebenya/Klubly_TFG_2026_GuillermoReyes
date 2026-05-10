package com.klubly.core.exception;

// Esta excepción sirve para cuando no se encuentra un ID
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}