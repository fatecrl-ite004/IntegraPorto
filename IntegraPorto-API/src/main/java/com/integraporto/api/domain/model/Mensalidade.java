package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mensalidade")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mensalidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chapeira_id", nullable = false)
    private Chapeira chapeira;

    @Column(name = "mes_referencia", nullable = false, length = 7)
    private String mesReferencia; // Ex: "05/2026"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(length = 20)
    private String statusPagamento; // PAGO, PENDENTE, ATRASADO
}
