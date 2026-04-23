package com.klubly.modules.identity.dto;

import java.util.List;

public record JwtAuthResponse(Long id, String accessToken, String tokenType, String username,
    String firstName,
    String lastName,
    String roleName,
    String avatarURL,
    List<Long> teamIds) {}
