package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.UsuarioRequest;
import com.integraporto.api.domain.dto.UsuarioResponse;
import com.integraporto.api.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Gestão de usuários do sistema e seus perfis de acesso (ADM, SEC, SUP, OP)")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Criar usuário", description = "Cadastra um novo usuário no sistema com e-mail, senha e perfil de acesso (ADM, SEC, SUP ou OP).")
    public ResponseEntity<UsuarioResponse> criarUsuario(@RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.criarUsuario(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Listar usuários", description = "Retorna todos os usuários cadastrados. Secretários (SEC) não visualizam administradores (ADM).")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios(org.springframework.security.core.Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(usuarioService.listarUsuarios(role));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Alterar perfil de acesso", description = "Altera o perfil de acesso (role) de um usuário. ADM pode alterar qualquer perfil; SEC não pode promover a ADM.")
    public ResponseEntity<UsuarioResponse> atualizarRole(
            @Parameter(description = "ID do usuário") @PathVariable Long id,
            @RequestBody UsuarioRequest request, org.springframework.security.core.Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(usuarioService.atualizarRole(id, request.getRole(), role));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADM', 'SEC')")
    @Operation(summary = "Ativar ou desativar usuário", description = "Alterna o status ativo/inativo de um usuário. Usuário inativo não consegue realizar login no sistema.")
    public ResponseEntity<UsuarioResponse> alterarStatus(
            @Parameter(description = "ID do usuário") @PathVariable Long id,
            org.springframework.security.core.Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(usuarioService.alterarStatus(id, role));
    }
}
