package com.integraporto.api.service;

import com.integraporto.api.domain.dto.PasswordRecoveryRequest;
import com.integraporto.api.domain.dto.PasswordResetRequest;
import com.integraporto.api.domain.dto.ResendEmailRequest;
import com.integraporto.api.domain.model.Usuario;
import com.integraporto.api.domain.repository.UsuarioRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.security.Key;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordRecoveryService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${app.frontend.url:https://www.integraporto.com.br}")
    private String frontendUrl;

    @Value("${MAIL_PASSWORD}") // Sua API Key do Resend vindo das Variáveis de Ambiente
    private String resendApiKey;

    public void sendRecoveryEmail(PasswordRecoveryRequest request) {
      Optional<Usuario> usuarioOpt = repository.findByEmail(request.getEmail());
      if (usuarioOpt.isEmpty()) return;

      Usuario user = usuarioOpt.get();
      String token = generateRecoveryToken(user.getEmail());
      String link = frontendUrl + "/redefinir-senha?token=" + token;

      // Cria o objeto de envio
      ResendEmailRequest emailData = new ResendEmailRequest(
          "IntegraPorto <no-reply@integraporto.com.br>",
          new String[]{user.getEmail()},
          "Recuperação de Senha — IntegraPorto",
          buildEmailHtml(link)
      );

      try {
          WebClient.builder().baseUrl("https://api.resend.com").build()
              .post()
              .uri("/emails")
              .header("Authorization", "Bearer " + resendApiKey)
              .bodyValue(emailData) // O WebClient converte o objeto em JSON automaticamente!
              .retrieve()
              .bodyToMono(String.class)
              .block();
      } catch (Exception e) {
          // Logue o erro detalhado para saber o que o Resend reclamou
          System.err.println("Erro ao enviar: " + e.getMessage());
          throw new RuntimeException("Erro ao enviar e-mail via API Resend.", e);
      }
    }

    // ... (Métodos resetPassword, generateRecoveryToken, extractUsername, getSignInKey permanecem iguais)

    public void resetPassword(PasswordResetRequest request) {
        try {
            String email = extractUsername(request.getToken());
            Usuario user = repository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
            user.setSenha(passwordEncoder.encode(request.getNewPassword()));
            repository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Token inválido ou expirado.");
        }
    }

    private String generateRecoveryToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 15))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String buildEmailHtml(String link) {
    return """
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#0f172a;padding:32px 40px;text-align:center;">
                    <span style="font-size:22px;font-weight:300;color:#ffffff;letter-spacing:1px;">
                      Integra<strong style="color:#3b82f6;">Porto</strong>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#1e293b;font-size:18px;font-weight:600;margin:0 0 12px;">Recuperação de Senha</p>
                    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
                      Recebemos uma solicitação de redefinição de senha para sua conta.
                      Clique no botão abaixo para criar uma nova senha. <strong>Este link é válido por 15 minutos.</strong>
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%%">
                      <tr>
                        <td align="center" style="padding:8px 0 28px;">
                          <a href="%s" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">
                            Redefinir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#94a3b8;font-size:12px;">Link: <a href="%s">%s</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;text-align:center;color:#94a3b8;font-size:11px;">
                    © %d IntegraPorto
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """.formatted(link, link, link, java.time.Year.now().getValue());
}
}