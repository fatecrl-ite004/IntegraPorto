package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.Cavalo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CavaloRepository extends JpaRepository<Cavalo, Long> {
}
