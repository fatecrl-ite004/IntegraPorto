package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trabalho")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trabalho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_operacao", length = 100)
    private String tipoOperacao;

    @Column(name = "tipo_trabalho", length = 50)
    private String tipoTrabalho; // MUNICIPAL, INTERMUNICIPAL

    @Column(name = "valor_frete", precision = 10, scale = 2)
    private BigDecimal valorFrete;

    @Column(name = "dt_solicitacao")
    private LocalDateTime dtSolicitacao;

    @Column(name = "dt_execucao")
    private LocalDateTime dtExecucao;

    @Column(name = "dt_termino")
    private LocalDateTime dtTermino;
    
    @Column(name = "transportadora", length = 150)
    private String transportadora;
    
    @Column(name = "qtde_containers")
    private Integer qtdeContainers;
    
    @Column(name = "tamanho_container", length = 20)
    private String tamanhoContainer; // "20" ou "40"
    
    @Column(name = "armador", length = 150)
    private String armador;
    
    @Column(name = "navio", length = 150)
    private String navio;

    @Column(length = 100)
    private String booking;

    @Column(length = 150)
    private String origem;

    @Column(length = 150)
    private String destino;

    @Column(name = "chapeira_inicio")
    private Integer chapeiraInicio;

    @Column(name = "chapeira_fim")
    private Integer chapeiraFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTrabalho status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operador_id")
    private Usuario operador;
    
    @PrePersist
    public void prePersist() {
        if(dtSolicitacao == null) {
            dtSolicitacao = LocalDateTime.now();
        }
        if(status == null) {
            status = StatusTrabalho.EM_ANDAMENTO;
        }
    }
}
