package com.integraporto.api.service;

import com.integraporto.api.domain.dto.ChapeiraResponse;
import com.integraporto.api.domain.model.*;
import com.integraporto.api.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapeiraService {
    private final ChapeiraRepository chapeiraRepository;
    private final PessoaRepository pessoaRepository;
    private final CavaloRepository cavaloRepository;
    private final CarretaRepository carretaRepository;

    public List<ChapeiraResponse> listar() {
        return chapeiraRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ChapeiraResponse buscarPorVaga(Integer vaga) {
        return chapeiraRepository.findByVaga(vaga).map(this::toDto).orElse(null);
    }

    @Transactional
    public ChapeiraResponse criarOuAtualizar(Integer vaga, Map<String, Object> body) {
        Chapeira chapeira = chapeiraRepository.findByVaga(vaga)
                .orElse(Chapeira.builder().vaga(vaga).build());

        chapeira.setTipoVaga(body.get("tipoVaga") != null ? body.get("tipoVaga").toString() : null);
        chapeira.setStatus(body.get("status") != null ? Boolean.valueOf(body.get("status").toString()) : true);
        chapeira.setChamar(body.get("chamar") != null ? body.get("chamar").toString() : null);

        // Responsável = dono da vaga (Associado)
        if (body.get("responsavelId") != null) {
            Long id = Long.valueOf(body.get("responsavelId").toString());
            chapeira.setResponsavel(pessoaRepository.findById(id).orElse(null));
        } else {
            chapeira.setResponsavel(null);
        }

        // Motorista = quem está trabalhando a vaga
        if (body.get("motoristaId") != null) {
            Long id = Long.valueOf(body.get("motoristaId").toString());
            chapeira.setMotorista(pessoaRepository.findById(id).orElse(null));
        } else {
            chapeira.setMotorista(null);
        }

        if (body.get("cavaloId") != null) {
            Long id = Long.valueOf(body.get("cavaloId").toString());
            chapeira.setCavalo(cavaloRepository.findById(id).orElse(null));
        } else {
            chapeira.setCavalo(null);
        }

        if (body.get("carretaId") != null) {
            Long id = Long.valueOf(body.get("carretaId").toString());
            chapeira.setCarreta(carretaRepository.findById(id).orElse(null));
        } else {
            chapeira.setCarreta(null);
        }

        return toDto(chapeiraRepository.save(chapeira));
    }

    public void deletar(Long id) {
        chapeiraRepository.deleteById(id);
    }

    @Transactional
    public ChapeiraResponse toggleInadimplencia(Integer vaga, Boolean inadimplente) {
        Chapeira c = chapeiraRepository.findByVaga(vaga).orElseThrow();
        c.setInadimplente(inadimplente);
        return toDto(chapeiraRepository.save(c));
    }

    private ChapeiraResponse toDto(Chapeira c) {
        return ChapeiraResponse.builder()
                .id(c.getId())
                .vaga(c.getVaga())
                .tipoVaga(c.getTipoVaga())
                .status(c.getStatus())
                .inadimplente(c.getInadimplente() != null ? c.getInadimplente() : false)
                .chamar(c.getChamar())
                .responsavelId(c.getResponsavel() != null ? c.getResponsavel().getId() : null)
                .responsavelNome(c.getResponsavel() != null ? c.getResponsavel().getNome() : null)
                .responsavelTelefone(c.getResponsavel() != null ? c.getResponsavel().getTelefone() : null)
                .responsavelCpf(c.getResponsavel() != null ? c.getResponsavel().getCpf() : null)
                .motoristaId(c.getMotorista() != null ? c.getMotorista().getId() : null)
                .motoristaNome(c.getMotorista() != null ? c.getMotorista().getNome() : null)
                .motoristaTelefone(c.getMotorista() != null ? c.getMotorista().getTelefone() : null)
                .motoristaCpf(c.getMotorista() != null ? c.getMotorista().getCpf() : null)
                .cavaloId(c.getCavalo() != null ? c.getCavalo().getId() : null)
                .cavaloPlaca(c.getCavalo() != null ? c.getCavalo().getPlaca() : null)
                .cavaloMarca(c.getCavalo() != null ? c.getCavalo().getMarca() : null)
                .cavaloModelo(c.getCavalo() != null ? c.getCavalo().getModelo() : null)
                .carretaId(c.getCarreta() != null ? c.getCarreta().getId() : null)
                .carretaPlaca(c.getCarreta() != null ? c.getCarreta().getPlaca() : null)
                .carretaMarca(c.getCarreta() != null ? c.getCarreta().getMarca() : null)
                .carretaModelo(c.getCarreta() != null ? c.getCarreta().getModelo() : null)
                .build();
    }
}
