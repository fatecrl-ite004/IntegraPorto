package com.integraporto.api.service;

import com.integraporto.api.domain.model.Transportadora;
import com.integraporto.api.domain.repository.TransportadoraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportadoraService {
    private final TransportadoraRepository transportadoraRepository;

    public List<Transportadora> listar() {
        return transportadoraRepository.findAll();
    }

    public Transportadora buscarPorId(Long id) {
        return transportadoraRepository.findById(id).orElseThrow(() -> new RuntimeException("Transportadora não encontrada"));
    }

    public Transportadora salvar(Transportadora transportadora) {
        return transportadoraRepository.save(transportadora);
    }

    public Transportadora atualizar(Long id, Transportadora dados) {
        Transportadora existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setCnpj(dados.getCnpj());
        existente.setCidade(dados.getCidade());
        existente.setUf(dados.getUf());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        existente.setAtivo(dados.getAtivo());
        return transportadoraRepository.save(existente);
    }

    public void deletar(Long id) {
        transportadoraRepository.deleteById(id);
    }
}
