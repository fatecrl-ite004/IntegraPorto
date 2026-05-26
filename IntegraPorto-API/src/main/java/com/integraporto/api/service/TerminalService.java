package com.integraporto.api.service;

import com.integraporto.api.domain.model.Terminal;
import com.integraporto.api.domain.repository.TerminalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TerminalService {
    private final TerminalRepository repository;

    public List<Terminal> listar() {
        return repository.findAll();
    }

    public Terminal buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Terminal não encontrado"));
    }

    public Terminal salvar(Terminal terminal) {
        return repository.save(terminal);
    }

    public Terminal atualizar(Long id, Terminal dados) {
        Terminal existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setCnpj(dados.getCnpj());
        existente.setEndereco(dados.getEndereco());
        existente.setContato(dados.getContato());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
