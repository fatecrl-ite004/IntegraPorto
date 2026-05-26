package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.MensalidadeRequest;
import com.integraporto.api.domain.dto.MensalidadeResponse;
import com.integraporto.api.service.MensalidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensalidades")
@RequiredArgsConstructor
@Tag(name = "Financeiro - Mensalidades", description = "Controle de mensalidades por chapeira, geração e registro de pagamentos")
public class MensalidadeController {

    private final MensalidadeService mensalidadeService;

    @GetMapping("/mes/{mesReferencia}")
    @Operation(summary = "Listar mensalidades por mês", description = "Retorna todas as mensalidades de um mês específico. Formato do parâmetro: MM-AAAA (ex: 05-2026).")
    public ResponseEntity<List<MensalidadeResponse>> listarPorMes(
            @Parameter(description = "Mês de referência no formato MM-AAAA (ex: 05-2026)") @PathVariable String mesReferencia) {
        // Exemplo: "05-2026" convertido pra "05/2026" pelo frontend ou backend
        return ResponseEntity.ok(mensalidadeService.listarPorMes(mesReferencia.replace("-", "/")));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Gerar mensalidades", description = "Gera as mensalidades para todas as chapeiras ativas do mês informado. Apenas ADM e SEC.")
    public ResponseEntity<MensalidadeResponse> gerar(@RequestBody MensalidadeRequest request) {
        return ResponseEntity.ok(mensalidadeService.gerarMensalidade(request));
    }

    @PostMapping("/lote")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Gerar mensalidades em lote", description = "Gera as mensalidades para todas as chapeiras ocupadas no mês.")
    public ResponseEntity<List<MensalidadeResponse>> gerarLote(@RequestBody MensalidadeRequest request) {
        return ResponseEntity.ok(mensalidadeService.gerarMensalidadesLote(request));
    }

    @PutMapping("/{id}/pagar")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Registrar pagamento", description = "Registra o pagamento de uma mensalidade pelo ID, alterando o status para PAGO.")
    public ResponseEntity<MensalidadeResponse> registrarPagamento(
            @Parameter(description = "ID da mensalidade") @PathVariable Long id) {
        return ResponseEntity.ok(mensalidadeService.registrarPagamento(id));
    }

    @PutMapping("/{id}/estornar")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Estornar pagamento", description = "Desfaz o pagamento de uma mensalidade pelo ID, alterando o status para PENDENTE.")
    public ResponseEntity<MensalidadeResponse> estornarPagamento(
            @Parameter(description = "ID da mensalidade") @PathVariable Long id) {
        return ResponseEntity.ok(mensalidadeService.estornarPagamento(id));
    }

    @PutMapping("/lote/pagar")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Registrar pagamento em lote", description = "Registra o pagamento de várias mensalidades pelos IDs.")
    public ResponseEntity<List<MensalidadeResponse>> registrarPagamentoLote(@RequestBody java.util.List<Long> ids) {
        return ResponseEntity.ok(mensalidadeService.registrarPagamentoLote(ids));
    }

    @PutMapping("/lote/estornar")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Estornar pagamento em lote", description = "Desfaz o pagamento de várias mensalidades pelos IDs.")
    public ResponseEntity<List<MensalidadeResponse>> estornarPagamentoLote(@RequestBody java.util.List<Long> ids) {
        return ResponseEntity.ok(mensalidadeService.estornarPagamentoLote(ids));
    }
}
