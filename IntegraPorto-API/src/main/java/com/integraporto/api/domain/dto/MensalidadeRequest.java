package com.integraporto.api.domain.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MensalidadeRequest {
    private Integer vaga;
    private String mesReferencia;
    private BigDecimal valor;
    private LocalDate dataVencimento;
}
