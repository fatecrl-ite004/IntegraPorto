package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.ControleFila;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ControleFilaRepository extends JpaRepository<ControleFila, Long> {
    Optional<ControleFila> findByTipoTrabalho(String tipoTrabalho);
}
