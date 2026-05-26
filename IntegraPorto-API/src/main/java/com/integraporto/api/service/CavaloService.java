package com.integraporto.api.service;

import com.integraporto.api.domain.model.Cavalo;
import com.integraporto.api.domain.model.Pessoa;
import com.integraporto.api.domain.repository.CavaloRepository;
import com.integraporto.api.domain.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CavaloService {
    private final CavaloRepository cavaloRepository;
    private final PessoaRepository pessoaRepository;

    public List<Cavalo> listar() {
        return cavaloRepository.findAll();
    }

    public Cavalo buscarPorId(Long id) {
        return cavaloRepository.findById(id).orElseThrow(() -> new RuntimeException("Cavalo não encontrado"));
    }

    public Cavalo salvar(Cavalo cavalo, Long proprietarioId) {
        if (proprietarioId != null) {
            Pessoa proprietario = pessoaRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));
            cavalo.setProprietario(proprietario);
        }
        return cavaloRepository.save(cavalo);
    }

    public Cavalo atualizar(Long id, Cavalo dados, Long proprietarioId) {
        Cavalo existente = buscarPorId(id);
        existente.setPlaca(dados.getPlaca());
        existente.setRenavan(dados.getRenavan());
        existente.setChassi(dados.getChassi());
        existente.setAntt(dados.getAntt());
        existente.setMarca(dados.getMarca());
        existente.setModelo(dados.getModelo());
        existente.setAno(dados.getAno());
        existente.setCor(dados.getCor());
        existente.setCidade(dados.getCidade());
        existente.setUf(dados.getUf());
        if (proprietarioId != null) {
            Pessoa proprietario = pessoaRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));
            existente.setProprietario(proprietario);
        }
        return cavaloRepository.save(existente);
    }

    public void deletar(Long id) {
        cavaloRepository.deleteById(id);
    }
}
