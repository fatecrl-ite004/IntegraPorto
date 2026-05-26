package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Terminal;
import com.integraporto.api.service.TerminalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terminais")
@RequiredArgsConstructor
@Tag(name = "Terminais", description = "Cadastro de terminais portuários (origem e destino das operações)")
public class TerminalController {
    private final TerminalService service;

    @GetMapping
    @Operation(summary = "Listar todos os terminais", description = "Retorna a lista completa de terminais portuários cadastrados no sistema.")
    public ResponseEntity<List<Terminal>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar terminal por ID", description = "Retorna os dados de um terminal portuário pelo identificador.")
    public ResponseEntity<Terminal> buscar(
            @Parameter(description = "ID do terminal") @PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar novo terminal", description = "Cadastra um novo terminal portuário no sistema. Apenas ADM e SEC.")
    public ResponseEntity<Terminal> criar(@RequestBody Terminal terminal) {
        return ResponseEntity.ok(service.salvar(terminal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar terminal", description = "Atualiza os dados de um terminal portuário existente.")
    public ResponseEntity<Terminal> atualizar(
            @Parameter(description = "ID do terminal") @PathVariable Long id,
            @RequestBody Terminal terminal) {
        return ResponseEntity.ok(service.atualizar(id, terminal));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir terminal", description = "Remove um terminal portuário do sistema. Apenas administradores (ADM).")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do terminal") @PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
