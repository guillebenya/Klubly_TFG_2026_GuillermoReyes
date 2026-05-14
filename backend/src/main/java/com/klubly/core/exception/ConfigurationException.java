package com.klubly.core.exception;

// Esta excepción sirve para errores de configuración (Falta una variable de entorno, JWT_SECRET demasiado corta...)
public class ConfigurationException extends RuntimeException {
    public ConfigurationException(String message) {
        super(message);
    }
}