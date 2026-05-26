package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pessoa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 150)
    private String nome;

    @Column(length = 11)
    private String cpf;

    @Column(length = 20)
    private String rg;

    @Column(name = "dt_nascimento")
    private LocalDate dtNascimento;

    @Column(name = "nm_pai", length = 150)
    private String nmPai;

    @Column(name = "nm_mae", length = 150)
    private String nmMae;

    @Column(length = 11)
    private String inss;

    @Column(length = 5)
    private String iss;

    @Column(length = 20)
    private String telefone;

    @Column(length = 20)
    private String cnh;

    @Column(name = "dt_validade_cnh")
    private java.time.LocalDate dtValidadeCnh;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        criadoEm = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
