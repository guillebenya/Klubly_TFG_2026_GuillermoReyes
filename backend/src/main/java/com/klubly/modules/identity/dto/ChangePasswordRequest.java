package com.klubly.modules.identity.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword,
    String confirmPassword
) {}