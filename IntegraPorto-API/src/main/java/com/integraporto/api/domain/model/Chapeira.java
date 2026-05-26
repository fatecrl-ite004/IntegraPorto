package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chapeira")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapeira {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Integer vaga;

    @Column(name = "tipo_vaga", length = 10)
    private String tipoVaga;

    private Boolean status;

    private Boolean inadimplente;

    @Column(length = 20)
    private String chamar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Pessoa responsavel;   // Dono da vaga (Associado)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id")
    private Pessoa motorista;     // Motorista que trabalha a vaga

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recebedor_id")
    private Pessoa recebedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cavalo_id")
    private Cavalo cavalo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carreta_id")
    private Carreta carreta;
}
