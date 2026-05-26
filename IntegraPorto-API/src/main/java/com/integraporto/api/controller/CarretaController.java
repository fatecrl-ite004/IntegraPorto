package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Carreta;
import com.integraporto.api.service.CarretaService;
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
@RequestMapping("/api/carretas")
@RequiredArgsConstructor
@Tag(name = "Carretas", description = "Cadastro de carretas e semi-reboques")
public class CarretaController {
    private final CarretaService carretaService;

    @GetMapping
    @Operation(summary = "Listar todas as carretas", description = "Retorna a lista completa de carretas/semi-reboques cadastradas no sistema.")
    public ResponseEntity<List<Carreta>> listar() {
        return ResponseEntity.ok(carretaService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar carreta por ID", description = "Retorna os dados completos de uma carreta pelo identificador.")
    public ResponseEntity<Carreta> buscar(
            @Parameter(description = "ID da carreta") @PathVariable Long id) {
        return ResponseEntity.ok(carretaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar nova carreta", description = "Cadastra uma nova carreta com placa, RENAVAN, chassi, ANTT, marca, modelo, ano, cor, cidade e UF. Pode vincular um proprietário (associado).")
    public ResponseEntity<Carreta> criar(@RequestBody Map<String, Object> body) {
        Carreta carreta = parseCarreta(body);
        Long proprietarioId = body.get("proprietarioId") != null ? Long.valueOf(body.get("proprietarioId").toString()) : null;
        return ResponseEntity.ok(carretaService.salvar(carreta, proprietarioId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar carreta", description = "Atualiza os dados de uma carreta existente.")
    public ResponseEntity<Carreta> atualizar(
            @Parameter(description = "ID da carreta") @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Carreta carreta = parseCarreta(body);
        Long proprietarioId = body.get("proprietarioId") != null ? Long.valueOf(body.get("proprietarioId").toString()) : null;
        return ResponseEntity.ok(carretaService.atualizar(id, carreta, proprietarioId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir carreta", description = "Remove uma carreta do sistema. Apenas administradores (ADM).")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID da carreta") @PathVariable Long id) {
        carretaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Carreta parseCarreta(Map<String, Object> body) {
        return Carreta.builder()
                .placa(str(body, "placa"))
                .renavan(str(body, "renavan"))
                .chassi(str(body, "chassi"))
                .antt(str(body, "antt"))
                .marca(str(body, "marca"))
                .modelo(str(body, "modelo"))
                .ano(body.get("ano") != null ? Short.valueOf(body.get("ano").toString()) : null)
                .cor(str(body, "cor"))
                .cidade(str(body, "cidade"))
                .uf(str(body, "uf"))
                .build();
    }

    private String str(Map<String, Object> body, String key) {
        return body.get(key) != null ? body.get(key).toString() : null;
    }
}
