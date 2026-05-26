package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.ChapeiraResponse;
import com.integraporto.api.service.ChapeiraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chapeiras")
@RequiredArgsConstructor
@Tag(name = "Chapeiras / Vagas", description = "Cadastro e gestão das vagas do sistema de fila circular (1 a 400)")
public class ChapeiraController {
    private final ChapeiraService chapeiraService;

    @GetMapping
    @Operation(summary = "Listar todas as chapeiras", description = "Retorna todas as chapeiras/vagas cadastradas com seus associados, motoristas e veículos vinculados.")
    public ResponseEntity<List<ChapeiraResponse>> listar() {
        return ResponseEntity.ok(chapeiraService.listar());
    }

    @GetMapping("/vaga/{vaga}")
    @Operation(summary = "Buscar chapeira por vaga", description = "Busca uma chapeira específica pelo número da vaga (1 a 400).")
    public ResponseEntity<ChapeiraResponse> buscarPorVaga(
            @Parameter(description = "Número da vaga (1 a 400)") @PathVariable Integer vaga) {
        ChapeiraResponse c = chapeiraService.buscarPorVaga(vaga);
        return c != null ? ResponseEntity.ok(c) : ResponseEntity.notFound().build();
    }

    @PutMapping("/vaga/{vaga}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC', 'SUP')")
    @Operation(summary = "Criar ou atualizar chapeira", description = "Cria ou atualiza uma chapeira na vaga informada, vinculando associado, motorista, cavalo mecânico e carreta.")
    public ResponseEntity<ChapeiraResponse> salvarVaga(
            @Parameter(description = "Número da vaga") @PathVariable Integer vaga,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(chapeiraService.criarOuAtualizar(vaga, body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir chapeira", description = "Exclui uma chapeira pelo ID. Apenas administradores (ADM) podem realizar esta ação.")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID da chapeira") @PathVariable Long id) {
        chapeiraService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/vaga/{vaga}/inadimplencia")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Alterar inadimplência", description = "Ativa ou desativa o status de inadimplência de uma chapeira. Chapeira inadimplente fica inativa e não entra na fila de trabalho.")
    public ResponseEntity<ChapeiraResponse> toggleInadimplencia(
            @Parameter(description = "Número da vaga") @PathVariable Integer vaga,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(chapeiraService.toggleInadimplencia(vaga, body.get("inadimplente")));
    }
}
