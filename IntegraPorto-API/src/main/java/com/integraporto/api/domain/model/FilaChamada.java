package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fila_chamada")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilaChamada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabalho_id")
    private Trabalho trabalho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapeira_id")
    private Chapeira chapeira;

    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusFilaChamada status;
}
