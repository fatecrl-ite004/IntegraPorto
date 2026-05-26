package com.integraporto.api.config;

import com.integraporto.api.domain.model.Role;
import com.integraporto.api.domain.model.Usuario;
import com.integraporto.api.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
            Usuario admin = Usuario.builder()
                    .email(adminEmail)
                    .senha(passwordEncoder.encode(adminPassword))
                    .role(Role.ADM)
                    .build();
            
            usuarioRepository.save(admin);
            System.out.println("=========================================================");
            System.out.println("Usuário Admin padrão criado: " + adminEmail);
            System.out.println("=========================================================");
        }
    }
}
