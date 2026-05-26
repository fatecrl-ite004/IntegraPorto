package com.integraporto.api.domain.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TrabalhoDetalheResponse {
    private Long id;
    private String tipoOperacao;
    private String tipoTrabalho;
    private BigDecimal valorFrete;
    private String transportadora;
    private Integer qtdeContainers;
    private String tamanhoContainer;
    private String armador;
    private String navio;
    private String booking;
    private String origem;
    private String destino;
    private LocalDateTime dtSolicitacao;
    private LocalDateTime dtExecucao;
    private LocalDateTime dtTermino;
    private String status;
    private Integer chapeiraInicio;
    private Integer chapeiraFim;
}
