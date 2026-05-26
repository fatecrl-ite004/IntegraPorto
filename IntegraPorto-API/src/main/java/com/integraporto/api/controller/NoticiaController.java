package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.NoticiaRequest;
import com.integraporto.api.domain.model.Noticia;
import com.integraporto.api.domain.model.Usuario;
import com.integraporto.api.domain.repository.NoticiaRepository;
import com.integraporto.api.domain.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
@RequiredArgsConstructor
@Tag(name = "Notícias", description = "Publicação e gestão de avisos e comunicados internos")
public class NoticiaController {

    private final NoticiaRepository noticiaRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    @Operation(summary = "Listar todas as notícias", description = "Retorna todas as notícias e comunicados publicados, ordenados pela data de publicação mais recente.")
    public ResponseEntity<List<Noticia>> listar() {
        return ResponseEntity.ok(noticiaRepository.findAllByOrderByDataPublicacaoDesc());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Publicar nova notícia", description = "Publica uma nova notícia ou comunicado interno. O autor é identificado automaticamente pelo token JWT. Apenas ADM e SEC.")
    public ResponseEntity<Noticia> criar(@RequestBody @Valid NoticiaRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario autor = usuarioRepository.findByEmail(email).orElseThrow();

        Noticia noticia = Noticia.builder()
                .titulo(request.getTitulo())
                .conteudo(request.getConteudo())
                .autor(autor)
                .build();
        
        return ResponseEntity.ok(noticiaRepository.save(noticia));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Excluir notícia", description = "Remove uma notícia ou comunicado pelo ID. Apenas ADM e SEC.")
    public ResponseEntity<Void> excluir(
            @Parameter(description = "ID da notícia") @PathVariable Long id) {
        noticiaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
