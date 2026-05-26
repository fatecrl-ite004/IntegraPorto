# IntegraPorto API (Backend)

O **IntegraPorto API** é o servidor back-end do sistema de gestão portuária responsável pelo gerenciamento de credenciamentos, motoristas, veículos (Cavalos e Carretas), vagas (Chapeiras) e controle financeiro (Mensalidades).

## 🚀 Tecnologias Utilizadas

- **Java 17+**
- **Spring Boot 3** - Framework principal da aplicação.
- **Spring Security & JWT** - Controle de acesso, segurança e autenticação stateless.
- **Spring Data JPA / Hibernate** - Mapeamento objeto-relacional (ORM) otimizado com `@EntityGraph` para alta performance (prevenção de problemas N+1).
- **PostgreSQL** - Banco de dados relacional.
- **Lombok** - Redução de código boilerplate.
- **Swagger (SpringDoc OpenAPI)** - Documentação automática dos endpoints.

## ⚙️ Pré-requisitos

- [JDK 17](https://jdk.java.net/17/) (ou superior)
- [Maven](https://maven.apache.org/) (ou utilize o `mvnw` incluído)
- Banco de dados **PostgreSQL** rodando localmente ou remotamente.

## 🛠️ Instalação e Execução

1. Clone ou faça o download deste repositório.
2. Configure as variáveis de ambiente necessárias. No arquivo `application.properties` (ou injetando pelo ambiente/IDE), defina:
   ```properties
   spring.datasource.url=jdbc:postgresql://<URL_DO_BANCO>:<PORTA>/<NOME_DO_BANCO>
   spring.datasource.username=<SEU_USUARIO>
   spring.datasource.password=<SUA_SENHA>
   
   # Chave Secreta para assinatura de tokens JWT
   jwt.secret=<CHAVE_SECRETA_ALEATORIA_SUPER_SEGURA>
   ```
3. Compile e execute a aplicação usando o Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   A aplicação inicializará na porta padrão (normalmente `http://localhost:8080`).

## 📚 Documentação da API (Swagger)

Com a aplicação rodando, você pode acessar e testar visualmente os endpoints através da interface do Swagger.
Acesse no seu navegador:
```text
http://localhost:8080/swagger-ui/index.html
```
*(Altere o host/porta conforme o seu ambiente)*

## 📦 Build e Deploy (Docker)

O projeto conta com um `Dockerfile` configurado para gerar imagens enxutas usando multi-stage build. Para criar a imagem da aplicação:
```bash
docker build -t integraporto-api .
```
E para rodar o container recém-criado, passando as variáveis de ambiente essenciais:
```bash
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://<HOST> \
  -e DB_USERNAME=<USER> \
  -e DB_PASSWORD=<PASS> \
  -e JWT_SECRET=<SECRET> \
  integraporto-api
```
