package com.integraporto.api.service;

import com.integraporto.api.domain.model.Pessoa;
import com.integraporto.api.domain.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PessoaService {
    private final PessoaRepository pessoaRepository;

    public List<Pessoa> listar() {
        return pessoaRepository.findAll();
    }

    public Pessoa buscarPorId(Long id) {
        return pessoaRepository.findById(id).orElseThrow(() -> new RuntimeException("Associado não encontrado"));
    }

    public Pessoa salvar(Pessoa pessoa) {
        return pessoaRepository.save(pessoa);
    }

    public Pessoa atualizar(Long id, Pessoa dados) {
        Pessoa existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setCpf(dados.getCpf());
        existente.setRg(dados.getRg());
        existente.setDtNascimento(dados.getDtNascimento());
        existente.setNmPai(dados.getNmPai());
        existente.setNmMae(dados.getNmMae());
        existente.setInss(dados.getInss());
        existente.setIss(dados.getIss());
        existente.setTelefone(dados.getTelefone());
        existente.setCnh(dados.getCnh());
        existente.setDtValidadeCnh(dados.getDtValidadeCnh());
        return pessoaRepository.save(existente);
    }

    public void deletar(Long id) {
        pessoaRepository.deleteById(id);
    }
}
