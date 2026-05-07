package com.klubly.modules.identity.dto;

public record RegisterDTO(
    String username,
    String email,
    String password,
    String firstName,
    String lastName,
    String phone,
    String avatarURL
) {}