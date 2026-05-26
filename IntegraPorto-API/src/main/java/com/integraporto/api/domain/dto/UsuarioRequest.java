package com.integraporto.api.domain.dto;
import lombok.Data;

@Data
public class UsuarioRequest {
    private String email;
    private String senha;
    private String role;
}
