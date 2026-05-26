package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conta_bancaria")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContaBancaria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pessoa_id")
    private Pessoa pessoa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_id")
    private Banco banco;

    @Column(length = 10)
    private String agencia;

    @Column(length = 20)
    private String conta;

    @Column(name = "tipo_conta", length = 10)
    private String tipoConta;

    @Column(length = 100)
    private String pix;
}
