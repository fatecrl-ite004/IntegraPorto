package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.Chapeira;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapeiraRepository extends JpaRepository<Chapeira, Long> {
    
    @EntityGraph(attributePaths = {"responsavel", "motorista", "recebedor", "cavalo", "carreta"})
    List<Chapeira> findAll();

    @EntityGraph(attributePaths = {"responsavel", "motorista", "recebedor", "cavalo", "carreta"})
    Optional<Chapeira> findByVaga(Integer vaga);
}
