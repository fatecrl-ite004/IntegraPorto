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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/motoristas")
@RequiredArgsConstructor
@Tag(name = "Motoristas", description = "Cadastro de motoristas e vínculo com associados e veículos")
public class MotoristaController {
    private final PessoaService pessoaService;

    @GetMapping
    @Operation(summary = "Listar todos os motoristas", description = "Retorna a lista de motoristas cadastrados. Motoristas são associados que possuem CNH preenchida.")
    public ResponseEntity<List<Pessoa>> listar() {
        // Motoristas são Pessoas que possuem CNH preenchida
        return ResponseEntity.ok(
            pessoaService.listar().stream()
                .filter(p -> p.getCnh() != null && !p.getCnh().isBlank())
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/cnh-vencendo")
    @Operation(summary = "Motoristas com CNH vencendo", description = "Lista motoristas cuja CNH vence nos próximos 30 dias. Útil para alertas de renovação.")
    public ResponseEntity<List<Pessoa>> cnhVencendo() {
        LocalDate limite = LocalDate.now().plusDays(30);
        return ResponseEntity.ok(
            pessoaService.listar().stream()
                .filter(p -> p.getCnh() != null && !p.getCnh().isBlank())
                .filter(p -> p.getDtValidadeCnh() != null && !p.getDtValidadeCnh().isAfter(limite))
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar motorista por ID", description = "Retorna os dados completos de um motorista pelo seu identificador.")
    public ResponseEntity<Pessoa> buscar(
            @Parameter(description = "ID do motorista") @PathVariable Long id) {
        return ResponseEntity.ok(pessoaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar novo motorista", description = "Cadastra um novo motorista no sistema. A CNH deve ser preenchida para que a pessoa seja considerada motorista.")
    public ResponseEntity<Pessoa> criar(@RequestBody Pessoa pessoa) {
        return ResponseEntity.ok(pessoaService.salvar(pessoa));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar motorista", description = "Atualiza os dados cadastrais de um motorista existente, incluindo CNH e validade.")
    public ResponseEntity<Pessoa> atualizar(
            @Parameter(description = "ID do motorista") @PathVariable Long id,
            @RequestBody Pessoa pessoa) {
        return ResponseEntity.ok(pessoaService.atualizar(id, pessoa));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir motorista", description = "Remove um motorista do sistema. Apenas administradores (ADM) podem realizar esta ação.")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do motorista") @PathVariable Long id) {
        pessoaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
