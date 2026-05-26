package com.integraporto.api.controller;

import com.integraporto.api.domain.dto.AuthRequest;
import com.integraporto.api.domain.dto.AuthResponse;
import com.integraporto.api.service.AuthenticationService;
import com.integraporto.api.service.PasswordRecoveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de login, recuperação e redefinição de senha")
public class AuthController {

    private final AuthenticationService service;
    private final PasswordRecoveryService passwordRecoveryService;

    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica o usuário com e-mail e senha, retornando um token JWT válido para uso nos demais endpoints.")
    public ResponseEntity<AuthResponse> authenticate(
            @Valid @RequestBody AuthRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/recover")
    @Operation(summary = "Recuperar senha", description = "Envia um e-mail com link de recuperação de senha para o endereço cadastrado no sistema.")
    public ResponseEntity<Void> recoverPassword(
            @RequestBody com.integraporto.api.domain.dto.PasswordRecoveryRequest request) {
        passwordRecoveryService.sendRecoveryEmail(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    @Operation(summary = "Redefinir senha", description = "Redefine a senha do usuário utilizando o token de recuperação recebido por e-mail.")
    public ResponseEntity<?> resetPassword(
            @RequestBody com.integraporto.api.domain.dto.PasswordResetRequest request) {
        try {
            passwordRecoveryService.resetPassword(request);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
