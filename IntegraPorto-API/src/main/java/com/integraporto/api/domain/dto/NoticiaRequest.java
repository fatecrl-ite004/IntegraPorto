package com.integraporto.api.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NoticiaRequest {
    @NotBlank
    private String titulo;
    
    @NotBlank
    private String conteudo;
}
