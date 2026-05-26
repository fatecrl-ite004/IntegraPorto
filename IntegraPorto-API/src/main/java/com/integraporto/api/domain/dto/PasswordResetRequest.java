package com.integraporto.api.domain.dto;
import lombok.Data;
@Data
public class PasswordResetRequest {
    private String token;
    private String newPassword;
}
