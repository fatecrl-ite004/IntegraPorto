package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Armador;
import com.integraporto.api.service.ArmadorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/armadores")
@RequiredArgsConstructor
@Tag(name = "Armadores", description = "Cadastro de armadores e companhias marítimas")
public class ArmadorController {
    private final ArmadorService armadorService;

    @GetMapping
    @Operation(summary = "Listar todos os armadores", description = "Retorna a lista completa de armadores/companhias marítimas cadastrados no sistema.")
    public ResponseEntity<List<Armador>> listar() {
        return ResponseEntity.ok(armadorService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar armador por ID", description = "Retorna os dados de um armador pelo identificador.")
    public ResponseEntity<Armador> buscar(
            @Parameter(description = "ID do armador") @PathVariable Long id) {
        return ResponseEntity.ok(armadorService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar novo armador", description = "Cadastra um novo armador/companhia marítima no sistema. Apenas ADM e SEC.")
    public ResponseEntity<Armador> criar(@RequestBody Armador armador) {
        return ResponseEntity.ok(armadorService.salvar(armador));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar armador", description = "Atualiza os dados de um armador existente.")
    public ResponseEntity<Armador> atualizar(
            @Parameter(description = "ID do armador") @PathVariable Long id,
            @RequestBody Armador armador) {
        return ResponseEntity.ok(armadorService.atualizar(id, armador));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir armador", description = "Remove um armador do sistema. Apenas administradores (ADM).")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do armador") @PathVariable Long id) {
        armadorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
