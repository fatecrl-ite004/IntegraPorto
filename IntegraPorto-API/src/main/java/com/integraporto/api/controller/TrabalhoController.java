package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.TrabalhoRequest;
import com.integraporto.api.domain.model.Trabalho;
import com.integraporto.api.service.TrabalhoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trabalhos")
@RequiredArgsConstructor
@Tag(name = "Trabalhos", description = "Gestão de folhas de trabalho, alocação automática de chapeiras pela fila circular e cancelamento parcial")
public class TrabalhoController {

    private final TrabalhoService trabalhoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC', 'SUP')")
    @Operation(summary = "Registrar novo trabalho", description = "Cria uma nova folha de trabalho e aloca automaticamente as chapeiras pela fila circular, priorizando motoristas na fila de retorno. O status inicial é EM_ANDAMENTO.")
    public ResponseEntity<Trabalho> criarTrabalho(@RequestBody TrabalhoRequest request) {
        return ResponseEntity.ok(trabalhoService.criarTrabalho(request));
    }

    @GetMapping
    @Operation(summary = "Listar todos os trabalhos", description = "Retorna a lista completa de folhas de trabalho registradas no sistema, com informações resumidas.")
    public ResponseEntity<List<com.integraporto.api.domain.dto.TrabalhoResponse>> listarTrabalhos() {
        return ResponseEntity.ok(trabalhoService.listarTrabalhos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes do trabalho", description = "Retorna os detalhes completos de uma folha de trabalho, incluindo datas, operador responsável e informações de containers.")
    public ResponseEntity<com.integraporto.api.domain.dto.TrabalhoDetalheResponse> obterTrabalho(
            @Parameter(description = "ID da folha de trabalho") @PathVariable Long id) {
        return ResponseEntity.ok(trabalhoService.obterTrabalho(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADM', 'SEC', 'SUP')")
    @Operation(summary = "Atualizar status do trabalho", description = "Altera o status de uma folha de trabalho para PENDENTE, EM_ANDAMENTO, CONCLUIDO ou CANCELADO. Ao concluir ou cancelar, a data de término é preenchida automaticamente.")
    public ResponseEntity<com.integraporto.api.domain.dto.TrabalhoDetalheResponse> atualizarStatus(
            @Parameter(description = "ID da folha de trabalho") @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(trabalhoService.atualizarStatus(id, body.get("status")));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADM', 'SEC', 'SUP')")
    @Operation(summary = "Atualizar dados do trabalho", description = "Atualiza os dados de uma folha de trabalho existente como tipo de operação, valor do frete, datas, transportadora, etc.")
    public ResponseEntity<com.integraporto.api.domain.dto.TrabalhoDetalheResponse> atualizar(
            @Parameter(description = "ID da folha de trabalho") @PathVariable Long id,
            @RequestBody TrabalhoRequest request) {
        return ResponseEntity.ok(trabalhoService.atualizar(id, request));
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADM', 'SEC', 'SUP')")
    @Operation(summary = "Cancelar trabalho (total ou parcial)", description = "Cancela uma folha de trabalho. Se o parâmetro vagaCancelamento for informado, o trabalho é marcado como PARCIALMENTE_CONCLUIDO e os motoristas a partir dessa vaga retornam à fila de retorno com prioridade.")
    public ResponseEntity<com.integraporto.api.domain.dto.TrabalhoDetalheResponse> cancelarTrabalho(
            @Parameter(description = "ID da folha de trabalho") @PathVariable Long id,
            @Parameter(description = "Número da vaga a partir da qual o cancelamento ocorre. Se omitido, cancela tudo.") @RequestParam(required = false) Integer vagaCancelamento) {
        trabalhoService.cancelarTrabalho(id, vagaCancelamento);
        return ResponseEntity.ok(trabalhoService.obterTrabalho(id));
    }

    @GetMapping("/{id}/motoristas")
    @Operation(summary = "Listar motoristas alocados", description = "Retorna a lista de motoristas/chapeiras alocados em uma folha de trabalho, com o número da chapeira, nome do motorista, veículo e status de chamada.")
    public ResponseEntity<List<com.integraporto.api.domain.dto.MotoristaAlocadoResponse>> listarMotoristasAlocados(
            @Parameter(description = "ID da folha de trabalho") @PathVariable Long id) {
        return ResponseEntity.ok(trabalhoService.listarMotoristasAlocados(id));
    }
}
