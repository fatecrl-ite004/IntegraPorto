package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.Mensalidade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MensalidadeRepository extends JpaRepository<Mensalidade, Long> {
    
    @EntityGraph(attributePaths = {"chapeira", "chapeira.responsavel", "chapeira.motorista"})
    List<Mensalidade> findByMesReferencia(String mesReferencia);
    
    @EntityGraph(attributePaths = {"chapeira", "chapeira.responsavel", "chapeira.motorista"})
    List<Mensalidade> findByChapeiraVaga(Integer vaga);
    
    boolean existsByChapeiraVagaAndMesReferencia(Integer vaga, String mesReferencia);
    
    Optional<Mensalidade> findByChapeiraVagaAndMesReferencia(Integer vaga, String mesReferencia);
}
