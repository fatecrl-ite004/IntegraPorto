package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carreta")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carreta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 7)
    private String placa;

    @Column(length = 11)
    private String renavan;

    @Column(length = 17)
    private String chassi;

    @Column(length = 20)
    private String antt;

    @Column(length = 100)
    private String marca;

    @Column(length = 100)
    private String modelo;

    private Short ano;

    @Column(name = "ano_exercicio")
    private Short anoExercicio;

    @Column(length = 50)
    private String cor;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String uf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id")
    private Pessoa proprietario;
}
