package com.integraporto.api.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banco")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banco {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nm_banco", length = 150)
    private String nmBanco;

    @Column(name = "cd_banco", length = 3)
    private String cdBanco;
}
