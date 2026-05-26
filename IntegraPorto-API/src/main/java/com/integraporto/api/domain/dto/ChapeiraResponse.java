package com.integraporto.api.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChapeiraResponse {
    private Long id;
    private Integer vaga;
    private String tipoVaga;
    private Boolean status;
    private Boolean inadimplente;
    private String chamar;

    // Responsável / Dono da vaga
    private Long responsavelId;
    private String responsavelNome;
    private String responsavelTelefone;
    private String responsavelCpf;

    // Motorista
    private Long motoristaId;
    private String motoristaNome;
    private String motoristaTelefone;
    private String motoristaCpf;

    // Veículos
    private Long cavaloId;
    private String cavaloPlaca;
    private String cavaloMarca;
    private String cavaloModelo;

    private Long carretaId;
    private String carretaPlaca;
    private String carretaMarca;
    private String carretaModelo;
}
