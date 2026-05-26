package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "controle_fila")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ControleFila {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_trabalho", unique = true, nullable = false)
    private String tipoTrabalho; // MUNICIPAL, INTERMUNICIPAL

    @Column(name = "ultima_vaga")
    private Integer ultimaVaga;
}
