package com.integraporto.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .servers(List.of(
                        new Server().url("https://integraporto.onrender.com").description("Produção (Render)"),
                        new Server().url("http://localhost:8080").description("Localhost")
                ))
                .info(new Info()
                        .title("IntegraPorto - API de Gestão Portuária")
                        .description("""
                                ## Sistema de Gestão de Operações Portuárias - IntegraPorto
                                
                                API RESTful para o gerenciamento completo das operações logísticas portuárias, 
                                incluindo controle de chapeiras (vagas), fila de trabalhos, motoristas, veículos, 
                                e módulo financeiro de mensalidades.
                                
                                ### Módulos Disponíveis
                                
                                - **🔐 Autenticação**: Login, geração de token JWT e redefinição de senha
                                - **🚛 Trabalhos**: Criação de folhas de trabalho, alocação automática de chapeiras pela fila circular, cancelamento parcial e total
                                - **📋 Chapeiras / Vagas**: Cadastro e gestão das 400 vagas do sistema de filas
                                - **👥 Associados**: Cadastro de pessoas físicas associadas ao sindicato
                                - **🏍️ Motoristas**: Cadastro de motoristas e vínculo com associados
                                - **🚚 Cavalos Mecânicos**: Cadastro de cavalos (caminhões trator)
                                - **🚗 Carretas**: Cadastro de carretas/semi-reboques
                                - **🏢 Transportadoras**: Cadastro de empresas transportadoras
                                - **⚓ Armadores**: Cadastro de armadores e navios
                                - **🏭 Terminais**: Cadastro de terminais portuários (origem/destino)
                                - **💰 Financeiro**: Controle de mensalidades e inadimplência por chapeira
                                - **📰 Notícias**: Publicação de avisos e comunicados internos
                                - **👤 Usuários**: Gestão de usuários do sistema (ADM, SEC, SUP, OP)
                                
                                ### Autenticação
                                
                                Todos os endpoints (exceto `/api/auth/**`) requerem um token JWT válido.
                                Para autenticar, faça login em `/api/auth/login` e use o token retornado 
                                no cabeçalho `Authorization: Bearer {token}`.
                                
                                ### Perfis de Acesso
                                
                                | Perfil | Descrição |
                                |--------|-----------|
                                | **ADM** | Administrador - Acesso total ao sistema |
                                | **SEC** | Secretário(a) - Gestão operacional e financeira |
                                | **SUP** | Supervisor - Acompanhamento de operações |
                                | **OP** | Operador - Visualização básica |
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("IntegraPorto - Suporte Técnico")
                                .email("suporte@integraporto.com.br"))
                        .license(new License()
                                .name("Uso Interno")
                                .url("https://integraporto.com.br")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Insira o token JWT obtido no endpoint de login. Exemplo: eyJhbGciOi...")));
    }
}
