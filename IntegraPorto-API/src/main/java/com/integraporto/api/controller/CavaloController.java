package com.integraporto.api.controller;

import com.integraporto.api.domain.model.Cavalo;
import com.integraporto.api.service.CavaloService;
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
@RequestMapping("/api/cavalos")
@RequiredArgsConstructor
@Tag(name = "Cavalos Mecânicos", description = "Cadastro de cavalos mecânicos (caminhões trator)")
public class CavaloController {
    private final CavaloService cavaloService;

    @GetMapping
    @Operation(summary = "Listar todos os cavalos", description = "Retorna a lista completa de cavalos mecânicos cadastrados no sistema.")
    public ResponseEntity<List<Cavalo>> listar() {
        return ResponseEntity.ok(cavaloService.listar());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cavalo por ID", description = "Retorna os dados completos de um cavalo mecânico pelo identificador.")
    public ResponseEntity<Cavalo> buscar(
            @Parameter(description = "ID do cavalo") @PathVariable Long id) {
        return ResponseEntity.ok(cavaloService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Cadastrar novo cavalo", description = "Cadastra um novo cavalo mecânico com placa, RENAVAN, chassi, ANTT, marca, modelo, ano, cor, cidade e UF. Pode vincular um proprietário (associado).")
    public ResponseEntity<Cavalo> criar(@RequestBody Map<String, Object> body) {
        Cavalo cavalo = parseCavalo(body);
        Long proprietarioId = body.get("proprietarioId") != null ? Long.valueOf(body.get("proprietarioId").toString()) : null;
        return ResponseEntity.ok(cavaloService.salvar(cavalo, proprietarioId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Atualizar cavalo", description = "Atualiza os dados de um cavalo mecânico existente.")
    public ResponseEntity<Cavalo> atualizar(
            @Parameter(description = "ID do cavalo") @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Cavalo cavalo = parseCavalo(body);
        Long proprietarioId = body.get("proprietarioId") != null ? Long.valueOf(body.get("proprietarioId").toString()) : null;
        return ResponseEntity.ok(cavaloService.atualizar(id, cavalo, proprietarioId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADM')")
    @Operation(summary = "Excluir cavalo", description = "Remove um cavalo mecânico do sistema. Apenas administradores (ADM).")
    public ResponseEntity<Void> deletar(
            @Parameter(description = "ID do cavalo") @PathVariable Long id) {
        cavaloService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private Cavalo parseCavalo(Map<String, Object> body) {
        return Cavalo.builder()
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
