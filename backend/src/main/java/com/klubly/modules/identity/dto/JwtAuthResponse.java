package com.klubly.modules.identity.dto;

public record JwtAuthResponse(String accessToken, String tokenType, String username,
    String firstName,
    String lastName,
    String roleName) {}
