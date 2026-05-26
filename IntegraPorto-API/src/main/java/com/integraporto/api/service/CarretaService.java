package com.integraporto.api.service;

import com.integraporto.api.domain.model.Carreta;
import com.integraporto.api.domain.model.Pessoa;
import com.integraporto.api.domain.repository.CarretaRepository;
import com.integraporto.api.domain.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarretaService {
    private final CarretaRepository carretaRepository;
    private final PessoaRepository pessoaRepository;

    public List<Carreta> listar() {
        return carretaRepository.findAll();
    }

    public Carreta buscarPorId(Long id) {
        return carretaRepository.findById(id).orElseThrow(() -> new RuntimeException("Carreta não encontrada"));
    }

    public Carreta salvar(Carreta carreta, Long proprietarioId) {
        if (proprietarioId != null) {
            Pessoa proprietario = pessoaRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietário não encontrado"));
            carreta.setProprietario(proprietario);
        }
        return carretaRepository.save(carreta);
    }

    public Carreta atualizar(Long id, Carreta dados, Long proprietarioId) {
        Carreta existente = buscarPorId(id);
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
        return carretaRepository.save(existente);
    }

    public void deletar(Long id) {
        carretaRepository.deleteById(id);
    }
}
