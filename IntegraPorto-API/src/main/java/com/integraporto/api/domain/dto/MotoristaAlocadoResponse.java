package com.integraporto.api.domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MotoristaAlocadoResponse {
    private Integer chapeira;
    private String motorista;
    private String veiculo;
    private String statusChamada;
}
