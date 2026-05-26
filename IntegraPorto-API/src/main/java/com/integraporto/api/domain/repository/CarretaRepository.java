package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.Carreta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarretaRepository extends JpaRepository<Carreta, Long> {
}
