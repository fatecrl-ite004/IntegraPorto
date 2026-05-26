package com.integraporto.api.domain.dto;

public record ResendEmailRequest(
    String from,
    String[] to,
    String subject,
    String html
) {}
