<div align="center">
  <h1>⚓ IntegraPorto</h1>
  <p><strong>Plataforma Completa de Gestão Logística</strong></p>
</div>

## 📌 Sobre o Projeto

O **IntegraPorto** é um software de ponta a ponta projetado para otimizar o gerenciamento e a operação de associações e terminais logísticos. O sistema atua de ponta a ponta: do controle e credenciamento de motoristas, veículos (cavalos/carretas) e associados, até o faturamento de mensalidades, chapeiras e análise de dashboards de recebimentos.

O projeto está arquitetado em um modelo **Monorepo Lógico**, dividido em duas frentes independentes para máxima escalabilidade: **Front-end** e **Back-end (API)**.

🌐 **Acesse:** [integraporto.com.br](https://www.integraporto.com.br) | [integraporto.com](https://www.integraporto.com)

---

## 🌟 Funcionalidades em Destaque

Além dos cruds robustos de gestão, o IntegraPorto conta com integrações avançadas que elevam a experiência de uso:

- **Automação de Dados Empresariais:** Integração nativa com API de CNPJ (BrasilAPI) para auto-preenchimento e validação instantânea de empresas, armadores e transportadoras.
- **Recuperação de Acesso Inteligente:** Fluxo seguro de redefinição de senhas com envio transacional de e-mails via API do **Resend**.
- **Gestão Financeira em Lote:** Seleção múltipla avançada e operações de baixa/estorno simultâneos de dezenas de faturas, eliminando o problema do "N+1" do banco de dados e rodando em frações de segundos através do `EntityGraph`.
- **Análise de Tráfego:** Mapeamento em tempo real de acessos, rotas e taxa de conversão alimentado pelo **Vercel Analytics**.

---

## 🏗️ Arquitetura e Tecnologias

### [IntegraPorto-FRONT](./IntegraPorto-FRONT)
A aplicação web foca na melhor experiência do usuário, construída para ser fluida e evitar recarregamentos desnecessários (SPA).
* **Stack:** React, Vite, Tailwind CSS
* **Gerência de Estado:** Zustand (Alta performance)
* **Comunicação e Roteamento:** Axios (com interceptors de Auth) e React Router
* **Hospedagem:** [Vercel](https://vercel.com) (Edge Network)

### [IntegraPorto-API](./IntegraPorto-API)
O servidor robusto responsável pelas regras de negócio, consistência de dados e segurança, servindo via API RESTful documentada automaticamente.
* **Stack:** Java 21, Spring Boot 3+
* **Segurança:** Spring Security com **JWT** Stateless e Role-Based Access Control (RBAC).
* **Banco de Dados:** PostgreSQL + Hibernate / JPA
* **Documentação (Swagger):** Documentação automática e interativa de todos os endpoints disponível publicamente em [integraporto.com.br/swagger-ui/index.html](http://integraporto.com.br/swagger-ui/index.html)
* **Hospedagem:** [Render](https://render.com)

---

## 🔐 Segurança

O IntegraPorto aplica rigorosos padrões de segurança em toda sua stack:
- Autenticação JWT com perfis (`Roles`) embutidos no *payload* criptografado.
- Proteção contra manipulação de estado (`Local Storage Spoofing`) via interceptadores do lado do cliente.
- Back-end protegido por anotações `@PreAuthorize`, exigindo tokens válidos e permissões adequadas em cada endpoint.

---

> 💡 *Para instruções de instalação, configuração local e execução, navegue até a pasta específica do módulo desejado (`IntegraPorto-FRONT` ou `IntegraPorto-API`) e consulte seu respectivo README.*
