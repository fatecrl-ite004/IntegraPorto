package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.FilaChamada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface FilaChamadaRepository extends JpaRepository<FilaChamada, Long> {
    List<FilaChamada> findByTrabalhoIdOrderByOrdemAsc(Long trabalhoId);

    @Query("SELECT f FROM FilaChamada f WHERE f.status = 'RETORNOU_INICIO' AND f.trabalho.tipoTrabalho = :tipoTrabalho ORDER BY f.chapeira.vaga ASC")
    List<FilaChamada> findRetornosPendentes(@Param("tipoTrabalho") String tipoTrabalho);
}
