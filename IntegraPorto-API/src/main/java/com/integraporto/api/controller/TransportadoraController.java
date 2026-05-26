package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Transportadora;
import com.integraporto.api.service.TransportadoraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transportadoras")
@RequiredArgsConstructor
@Tag(name = "Transportadoras", description = "Cadastro de empresas transportadoras")
public class TransportadoraController {
    private final TransportadoraService transportadoraService;

    @GetMapping
    @Operation(summary = "Listar todas as transportadoras", description = "Retorna a lista completa de empresas transportadoras cadastradas no sistema.")
    public ResponseEntity<List<Transportadora>> listar() {
        return ResponseEntity.ok(transportadoraService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar transportadora por ID", description = "Retorna os dados de uma transportadora pelo identificador.")
    public ResponseEntity<Transportadora> buscar(
            @Parameter(description = "ID da transportadora") @PathVariable Long id) {
        return ResponseEntity.ok(transportadoraService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar nova transportadora", description = "Cadastra uma nova empresa transportadora no sistema. Apenas ADM e SEC.")
    public ResponseEntity<Transportadora> criar(@RequestBody Transportadora transportadora) {
        return ResponseEntity.ok(transportadoraService.salvar(transportadora));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar transportadora", description = "Atualiza os dados de uma transportadora existente.")
    public ResponseEntity<Transportadora> atualizar(
            @Parameter(description = "ID da transportadora") @PathVariable Long id,
            @RequestBody Transportadora transportadora) {
        return ResponseEntity.ok(transportadoraService.atualizar(id, transportadora));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir transportadora", description = "Remove uma transportadora do sistema. Apenas administradores (ADM).")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID da transportadora") @PathVariable Long id) {
        transportadoraService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
