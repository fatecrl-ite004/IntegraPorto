package com.integraporto.api.service;

import com.integraporto.api.domain.dto.TrabalhoRequest;
import com.integraporto.api.domain.model.*;
import com.integraporto.api.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrabalhoService {

    private final TrabalhoRepository trabalhoRepository;
    private final FilaChamadaRepository filaChamadaRepository;
    private final ChapeiraRepository chapeiraRepository;
    private final ControleFilaRepository controleFilaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Trabalho criarTrabalho(TrabalhoRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario operador = usuarioRepository.findByEmail(email).orElseThrow();

        Trabalho trabalho = Trabalho.builder()
                .tipoOperacao(request.getTipoOperacao())
                .tipoTrabalho(request.getTipoTrabalho())
                .valorFrete(request.getValorFrete())
                .dtSolicitacao(request.getDtSolicitacao())
                .dtExecucao(request.getDtExecucao())
                .dtTermino(request.getDtTermino())
                .transportadora(request.getTransportadora())
                .qtdeContainers(request.getQtdeContainers())
                .tamanhoContainer(request.getTamanhoContainer())
                .armador(request.getArmador())
                .navio(request.getNavio())
                .booking(request.getBooking())
                .origem(request.getOrigem())
                .destino(request.getDestino())
                .operador(operador)
                .status(StatusTrabalho.EM_ANDAMENTO)
                .build();

        trabalho = trabalhoRepository.save(trabalho);

        ControleFila controle = controleFilaRepository.findByTipoTrabalho(request.getTipoTrabalho())
                .orElse(ControleFila.builder()
                        .tipoTrabalho(request.getTipoTrabalho())
                        .ultimaVaga(request.getTipoTrabalho().equals("MUNICIPAL") ? 0 : 401)
                        .build());

        List<Chapeira> todasChapeiras = chapeiraRepository.findAll();
        List<Chapeira> ativas = todasChapeiras.stream()
                .filter(c -> Boolean.TRUE.equals(c.getStatus()) && !Boolean.TRUE.equals(c.getInadimplente()))
                .collect(Collectors.toList());
        
        int motoristasNecessarios;
        if ("20".equals(request.getTamanhoContainer())) {
            motoristasNecessarios = (int) Math.ceil(request.getQtdeContainers() / 2.0);
        } else {
            motoristasNecessarios = request.getQtdeContainers();
        }
        
        int containersFaltantes = motoristasNecessarios;
        int vagaAtual = controle.getUltimaVaga();
        
        List<FilaChamada> chamadas = new ArrayList<>();
        Integer chapeiraInicio = null;
        Integer chapeiraFim = null;
        
        int ordem = 1;

        // 1. Prioridade para motoristas que retornaram ao início (cancelamentos)
        List<FilaChamada> retornos = filaChamadaRepository.findRetornosPendentes(request.getTipoTrabalho());
        for (FilaChamada retorno : retornos) {
            if (containersFaltantes <= 0) break;
            
            Chapeira escolhida = retorno.getChapeira();
            // Verifica se a chapeira ainda está ativa
            if (ativas.stream().noneMatch(c -> c.getId().equals(escolhida.getId()))) continue;

            if (chapeiraInicio == null) chapeiraInicio = escolhida.getVaga();
            chapeiraFim = escolhida.getVaga();
            
            FilaChamada fc = FilaChamada.builder()
                    .trabalho(trabalho)
                    .chapeira(escolhida)
                    .ordem(ordem++)
                    .status(StatusFilaChamada.CHAMADO)
                    .build();
            chamadas.add(fc);
            
            retorno.setStatus(StatusFilaChamada.COMPENSADO);
            filaChamadaRepository.save(retorno);
            
            ativas.removeIf(c -> c.getId().equals(escolhida.getId()));
            containersFaltantes--;
        }

        // 2. Continua girando a fila normal
        while(containersFaltantes > 0 && !ativas.isEmpty()) {
            if (request.getTipoTrabalho().equals("MUNICIPAL")) {
                vagaAtual++;
                if (vagaAtual > 400) vagaAtual = 1;
            } else {
                vagaAtual--;
                if (vagaAtual < 1) vagaAtual = 400;
            }
            
            final int buscaVaga = vagaAtual;
            Chapeira escolhida = ativas.stream().filter(c -> c.getVaga() != null && c.getVaga() == buscaVaga).findFirst().orElse(null);
            
            if (escolhida != null) {
                if (chapeiraInicio == null) chapeiraInicio = escolhida.getVaga();
                chapeiraFim = escolhida.getVaga();
                
                FilaChamada fc = FilaChamada.builder()
                        .trabalho(trabalho)
                        .chapeira(escolhida)
                        .ordem(ordem++)
                        .status(StatusFilaChamada.CHAMADO)
                        .build();
                chamadas.add(fc);
                ativas.removeIf(c -> c.getId().equals(escolhida.getId()));
                containersFaltantes--;
            }
        }
        
        filaChamadaRepository.saveAll(chamadas);
        controle.setUltimaVaga(vagaAtual);
        controleFilaRepository.save(controle);
        
        trabalho.setChapeiraInicio(chapeiraInicio);
        trabalho.setChapeiraFim(chapeiraFim);
        return trabalhoRepository.save(trabalho);
    }

    @Transactional
    public Trabalho cancelarTrabalho(Long trabalhoId, Integer vagaCancelamento) {
        Trabalho trabalho = trabalhoRepository.findById(trabalhoId).orElseThrow();
        
        List<FilaChamada> fila = filaChamadaRepository.findByTrabalhoIdOrderByOrdemAsc(trabalhoId);
        
        boolean passouDoCorte = (vagaCancelamento == null);
        
        for (FilaChamada fc : fila) {
            if (!passouDoCorte) {
                fc.setStatus(StatusFilaChamada.FOI_PARA_FINAL);
                if (fc.getChapeira().getVaga().equals(vagaCancelamento)) {
                    passouDoCorte = true;
                    fc.setStatus(StatusFilaChamada.RETORNOU_INICIO); // O corte também volta ao início
                }
            } else {
                fc.setStatus(StatusFilaChamada.RETORNOU_INICIO);
            }
        }
        filaChamadaRepository.saveAll(fila);
        
        if (vagaCancelamento == null) {
            trabalho.setStatus(StatusTrabalho.CANCELADO);
        } else {
            trabalho.setStatus(StatusTrabalho.PARCIALMENTE_CONCLUIDO);
        }
        trabalho.setDtTermino(java.time.LocalDateTime.now());
        
        return trabalhoRepository.save(trabalho);
    }

    public List<com.integraporto.api.domain.dto.TrabalhoResponse> listarTrabalhos() {
        return trabalhoRepository.findAll().stream().map(t -> com.integraporto.api.domain.dto.TrabalhoResponse.builder()
                .id(t.getId())
                .tipoOperacao(t.getTipoOperacao())
                .origem(t.getOrigem())
                .destino(t.getDestino())
                .qtdeContainers(t.getQtdeContainers())
                .status(t.getStatus().name())
                .chapeiraInicio(t.getChapeiraInicio())
                .chapeiraFim(t.getChapeiraFim())
                .build()).collect(Collectors.toList());
    }

    public com.integraporto.api.domain.dto.TrabalhoDetalheResponse obterTrabalho(Long id) {
        Trabalho t = trabalhoRepository.findById(id).orElseThrow();
        return com.integraporto.api.domain.dto.TrabalhoDetalheResponse.builder()
                .id(t.getId())
                .tipoOperacao(t.getTipoOperacao())
                .tipoTrabalho(t.getTipoTrabalho())
                .valorFrete(t.getValorFrete())
                .transportadora(t.getTransportadora())
                .qtdeContainers(t.getQtdeContainers())
                .tamanhoContainer(t.getTamanhoContainer())
                .armador(t.getArmador())
                .navio(t.getNavio())
                .booking(t.getBooking())
                .origem(t.getOrigem())
                .destino(t.getDestino())
                .dtSolicitacao(t.getDtSolicitacao())
                .dtExecucao(t.getDtExecucao())
                .dtTermino(t.getDtTermino())
                .status(t.getStatus().name())
                .chapeiraInicio(t.getChapeiraInicio())
                .chapeiraFim(t.getChapeiraFim())
                .build();
    }

    public com.integraporto.api.domain.dto.TrabalhoDetalheResponse atualizarStatus(Long id, String novoStatus) {
        Trabalho t = trabalhoRepository.findById(id).orElseThrow();
        StatusTrabalho status = StatusTrabalho.valueOf(novoStatus);
        t.setStatus(status);
        if (status == StatusTrabalho.CONCLUIDO || status == StatusTrabalho.CANCELADO) {
            t.setDtTermino(java.time.LocalDateTime.now());
        }
        trabalhoRepository.save(t);
        return obterTrabalho(id);
    }

    @Transactional
    public com.integraporto.api.domain.dto.TrabalhoDetalheResponse atualizar(Long id, TrabalhoRequest request) {
        Trabalho t = trabalhoRepository.findById(id).orElseThrow();
        t.setTipoOperacao(request.getTipoOperacao());
        t.setTipoTrabalho(request.getTipoTrabalho());
        t.setValorFrete(request.getValorFrete());
        t.setDtExecucao(request.getDtExecucao());
        t.setDtTermino(request.getDtTermino());
        t.setTransportadora(request.getTransportadora());
        t.setQtdeContainers(request.getQtdeContainers());
        t.setTamanhoContainer(request.getTamanhoContainer());
        t.setArmador(request.getArmador());
        t.setNavio(request.getNavio());
        t.setBooking(request.getBooking());
        t.setOrigem(request.getOrigem());
        t.setDestino(request.getDestino());
        trabalhoRepository.save(t);
        return obterTrabalho(id);
    }

    public List<com.integraporto.api.domain.dto.MotoristaAlocadoResponse> listarMotoristasAlocados(Long trabalhoId) {
        List<FilaChamada> chamadas = filaChamadaRepository.findByTrabalhoIdOrderByOrdemAsc(trabalhoId);
        return chamadas.stream().map(fc -> {
            Chapeira c = fc.getChapeira();
            String motoristaNome = c.getMotorista() != null ? c.getMotorista().getNome() : "Aguardando Associação do Motorista";
            String veiculoPlaca = c.getCavalo() != null ? c.getCavalo().getPlaca() : "-";
            return com.integraporto.api.domain.dto.MotoristaAlocadoResponse.builder()
                    .chapeira(c.getVaga())
                    .motorista(motoristaNome)
                    .veiculo(veiculoPlaca != null ? veiculoPlaca.toUpperCase() : "-")
                    .statusChamada(fc.getStatus().name())
                    .build();
        }).collect(Collectors.toList());
    }
}
