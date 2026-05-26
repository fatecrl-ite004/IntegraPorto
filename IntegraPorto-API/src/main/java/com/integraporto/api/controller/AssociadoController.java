package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Pessoa;
import com.integraporto.api.service.PessoaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/associados")
@RequiredArgsConstructor
@Tag(name = "Associados", description = "Cadastro de pessoas físicas associadas ao sindicato")
public class AssociadoController {
    private final PessoaService pessoaService;

    @GetMapping
    @Operation(summary = "Listar todos os associados", description = "Retorna a lista completa de pessoas físicas (associados) cadastradas no sistema.")
    public ResponseEntity<List<Pessoa>> listar() {
        return ResponseEntity.ok(pessoaService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar associado por ID", description = "Retorna os dados completos de um associado pelo seu identificador.")
    public ResponseEntity<Pessoa> buscar(
            @Parameter(description = "ID do associado") @PathVariable Long id) {
        return ResponseEntity.ok(pessoaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar novo associado", description = "Cadastra uma nova pessoa física como associada do sindicato. Apenas ADM e SEC.")
    public ResponseEntity<Pessoa> criar(@RequestBody Pessoa pessoa) {
        return ResponseEntity.ok(pessoaService.salvar(pessoa));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar associado", description = "Atualiza os dados cadastrais de um associado existente.")
    public ResponseEntity<Pessoa> atualizar(
            @Parameter(description = "ID do associado") @PathVariable Long id,
            @RequestBody Pessoa pessoa) {
        return ResponseEntity.ok(pessoaService.atualizar(id, pessoa));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir associado", description = "Remove um associado do sistema. Apenas administradores (ADM) podem realizar esta ação.")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do associado") @PathVariable Long id) {
        pessoaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
