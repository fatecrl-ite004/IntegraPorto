package com.integraporto.api.service;

import com.integraporto.api.domain.dto.MensalidadeRequest;
import com.integraporto.api.domain.dto.MensalidadeResponse;
import com.integraporto.api.domain.model.Chapeira;
import com.integraporto.api.domain.model.Mensalidade;
import com.integraporto.api.domain.repository.ChapeiraRepository;
import com.integraporto.api.domain.repository.MensalidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MensalidadeService {

    private final MensalidadeRepository mensalidadeRepository;
    private final ChapeiraRepository chapeiraRepository;

    public List<MensalidadeResponse> listarPorMes(String mesReferencia) {
        return mensalidadeRepository.findByMesReferencia(mesReferencia).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MensalidadeResponse gerarMensalidade(MensalidadeRequest request) {
        Mensalidade existente = mensalidadeRepository.findByChapeiraVagaAndMesReferencia(request.getVaga(), request.getMesReferencia()).orElse(null);
        if (existente != null) {
            if ("PAGO".equals(existente.getStatusPagamento())) {
                throw new RuntimeException("Mensalidade já paga, não pode ser alterada.");
            }
            existente.setValor(request.getValor());
            existente.setDataVencimento(request.getDataVencimento());
            return toResponse(mensalidadeRepository.save(existente));
        }

        Chapeira chapeira = chapeiraRepository.findByVaga(request.getVaga()).orElseThrow();
        
        Mensalidade mensalidade = Mensalidade.builder()
                .chapeira(chapeira)
                .mesReferencia(request.getMesReferencia())
                .valor(request.getValor())
                .dataVencimento(request.getDataVencimento())
                .statusPagamento("PENDENTE")
                .build();

        return toResponse(mensalidadeRepository.save(mensalidade));
    }

    public List<MensalidadeResponse> gerarMensalidadesLote(MensalidadeRequest request) {
        List<Chapeira> ativas = chapeiraRepository.findAll().stream()
                .filter(c -> c.getStatus() != null && c.getStatus() && (c.getResponsavel() != null || c.getMotorista() != null))
                .collect(Collectors.toList());

        List<MensalidadeResponse> geradas = new java.util.ArrayList<>();

        for (Chapeira chapeira : ativas) {
            Mensalidade existente = mensalidadeRepository.findByChapeiraVagaAndMesReferencia(chapeira.getVaga(), request.getMesReferencia()).orElse(null);
            
            if (existente != null) {
                if (!"PAGO".equals(existente.getStatusPagamento()) && request.getValor().compareTo(existente.getValor()) != 0) {
                    existente.setValor(request.getValor());
                    existente.setDataVencimento(request.getDataVencimento());
                    geradas.add(toResponse(mensalidadeRepository.save(existente)));
                }
            } else {
                Mensalidade mensalidade = Mensalidade.builder()
                        .chapeira(chapeira)
                        .mesReferencia(request.getMesReferencia())
                        .valor(request.getValor())
                        .dataVencimento(request.getDataVencimento())
                        .statusPagamento("PENDENTE")
                        .build();
                geradas.add(toResponse(mensalidadeRepository.save(mensalidade)));
            }
        }
        return geradas;
    }

    public MensalidadeResponse registrarPagamento(Long id) {
        Mensalidade m = mensalidadeRepository.findById(id).orElseThrow();
        m.setDataPagamento(LocalDate.now());
        m.setStatusPagamento("PAGO");
        return toResponse(mensalidadeRepository.save(m));
    }

    public MensalidadeResponse estornarPagamento(Long id) {
        Mensalidade m = mensalidadeRepository.findById(id).orElseThrow();
        m.setDataPagamento(null);
        m.setStatusPagamento("PENDENTE");
        return toResponse(mensalidadeRepository.save(m));
    }

    @Transactional
    public List<MensalidadeResponse> registrarPagamentoLote(List<Long> ids) {
        List<MensalidadeResponse> atualizadas = new ArrayList<>();
        for (Long id : ids) {
            Mensalidade mensalidade = mensalidadeRepository.findById(id).orElse(null);
            if (mensalidade != null && !"PAGO".equals(mensalidade.getStatusPagamento())) {
                mensalidade.setStatusPagamento("PAGO");
                mensalidade.setDataPagamento(LocalDate.now());
                mensalidadeRepository.save(mensalidade);
                atualizadas.add(toResponse(mensalidade));
            }
        }
        return atualizadas;
    }

    @Transactional
    public List<MensalidadeResponse> estornarPagamentoLote(List<Long> ids) {
        List<MensalidadeResponse> estornadas = new ArrayList<>();
        for (Long id : ids) {
            Mensalidade mensalidade = mensalidadeRepository.findById(id).orElse(null);
            if (mensalidade != null && "PAGO".equals(mensalidade.getStatusPagamento())) {
                mensalidade.setStatusPagamento("PENDENTE");
                mensalidade.setDataPagamento(null);
                mensalidadeRepository.save(mensalidade);
                estornadas.add(toResponse(mensalidade));
            }
        }
        return estornadas;
    }

    private MensalidadeResponse toResponse(Mensalidade m) {
        return MensalidadeResponse.builder()
                .id(m.getId())
                .vaga(m.getChapeira().getVaga())
                .mesReferencia(m.getMesReferencia())
                .valor(m.getValor())
                .dataVencimento(m.getDataVencimento())
                .dataPagamento(m.getDataPagamento())
                .statusPagamento(m.getStatusPagamento())
                .build();
    }
}
