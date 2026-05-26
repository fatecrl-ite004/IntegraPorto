package com.integraporto.api.service;

import com.integraporto.api.domain.model.Armador;
import com.integraporto.api.domain.repository.ArmadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArmadorService {
    private final ArmadorRepository armadorRepository;

    public List<Armador> listar() {
        return armadorRepository.findAll();
    }

    public Armador buscarPorId(Long id) {
        return armadorRepository.findById(id).orElseThrow(() -> new RuntimeException("Armador não encontrado"));
    }

    public Armador salvar(Armador armador) {
        return armadorRepository.save(armador);
    }

    public Armador atualizar(Long id, Armador dados) {
        Armador existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setCnpj(dados.getCnpj());
        existente.setPais(dados.getPais());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        existente.setAtivo(dados.getAtivo());
        return armadorRepository.save(existente);
    }

    public void deletar(Long id) {
        armadorRepository.deleteById(id);
    }
}
