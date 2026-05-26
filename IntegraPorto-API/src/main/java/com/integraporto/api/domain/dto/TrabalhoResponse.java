package com.integraporto.api.domain.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrabalhoResponse {
    private Long id;
    private String tipoOperacao;
    private String origem;
    private String destino;
    private Integer qtdeContainers;
    private String status;
    private Integer chapeiraInicio;
    private Integer chapeiraFim;
}
