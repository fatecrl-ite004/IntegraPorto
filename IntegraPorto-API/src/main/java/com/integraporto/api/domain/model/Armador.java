package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "armador")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Armador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 18)
    private String cnpj;

    @Column(length = 150)
    private String pais;

    @Column(length = 20)
    private String telefone;

    @Column(length = 150)
    private String email;
    
    private Boolean ativo = true;
}
