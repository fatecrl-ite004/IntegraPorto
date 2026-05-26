package com.integraporto.api.domain.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MensalidadeResponse {
    private Long id;
    private Integer vaga;
    private String mesReferencia;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;
    private String statusPagamento;
}
