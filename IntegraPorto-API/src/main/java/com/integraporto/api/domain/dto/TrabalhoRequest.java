package com.integraporto.api.domain.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TrabalhoRequest {
    private String tipoOperacao;
    private String tipoTrabalho; // MUNICIPAL, INTERMUNICIPAL
    private BigDecimal valorFrete;
    private LocalDateTime dtSolicitacao;
    private LocalDateTime dtExecucao;
    private LocalDateTime dtTermino;
    private String transportadora;
    private Integer qtdeContainers;
    private String tamanhoContainer;
    private String armador;
    private String navio;
    private String booking;
    private String origem;
    private String destino;
}
