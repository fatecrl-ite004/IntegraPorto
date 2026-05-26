package com.integraporto.api.domain.repository;

import com.integraporto.api.domain.model.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findAllByOrderByDataPublicacaoDesc();
}
