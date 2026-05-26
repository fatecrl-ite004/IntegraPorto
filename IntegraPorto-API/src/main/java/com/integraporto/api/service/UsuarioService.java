package com.integraporto.api.service;

import com.integraporto.api.domain.dto.UsuarioRequest;
import com.integraporto.api.domain.dto.UsuarioResponse;
import com.integraporto.api.domain.model.Role;
import com.integraporto.api.domain.model.Usuario;
import com.integraporto.api.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioResponse criarUsuario(UsuarioRequest request) {
        if(usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já está em uso.");
        }
        
        Usuario usuario = Usuario.builder()
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .role(Role.valueOf(request.getRole()))
                .build();
                
        usuario = usuarioRepository.save(usuario);
        
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .role(usuario.getRole().name())
                .ativo(usuario.isAtivo())
                .build();
    }

    public List<UsuarioResponse> listarUsuarios(String requesterRole) {
        return usuarioRepository.findAll().stream()
                .filter(u -> {
                    if (requesterRole.equals("ROLE_SEC") && u.getRole() == Role.ADM) {
                        return false; // SEC não vê ADM
                    }
                    return true;
                })
                .map(u -> UsuarioResponse.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .ativo(u.isAtivo())
                        .build())
                .collect(Collectors.toList());
    }

    public UsuarioResponse atualizarRole(Long id, String novaRole, String requesterRole) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        
        if (requesterRole.equals("ROLE_SEC") && (novaRole.equals("ADM") || usuario.getRole() == Role.ADM)) {
            throw new RuntimeException("Acesso negado: Secretária não pode manipular permissões de Administrador.");
        }
        
        usuario.setRole(Role.valueOf(novaRole));
        usuarioRepository.save(usuario);
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .role(usuario.getRole().name())
                .ativo(usuario.isAtivo())
                .build();
    }

    public UsuarioResponse alterarStatus(Long id, String requesterRole) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        
        if (requesterRole.equals("ROLE_SEC") && usuario.getRole() == Role.ADM) {
            throw new RuntimeException("Acesso negado: Secretária não pode bloquear um Administrador.");
        }
        
        usuario.setAtivo(!usuario.isAtivo());
        usuarioRepository.save(usuario);
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .role(usuario.getRole().name())
                .ativo(usuario.isAtivo())
                .build();
    }
}
