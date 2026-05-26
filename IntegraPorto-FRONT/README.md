# IntegraPorto Web (Frontend)

O **IntegraPorto Web** é o portal de interface de usuário do sistema de gestão portuária. Ele consome a [IntegraPorto API](../IntegraPorto-API-main) para o gerenciamento de credenciamentos, motoristas, veículos e operações financeiras.

## 🚀 Tecnologias Utilizadas

Este projeto foi inicializado com [Vite](https://vitejs.dev/) e desenvolvido com as seguintes ferramentas modernas:

- **[React](https://react.dev/)** - Biblioteca principal para construção da interface.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework utilitário de CSS para estilização ágil e responsiva.
- **[Zustand](https://github.com/pmndrs/zustand)** - Gerenciamento de estado global otimizado (substituindo o Context API para melhor performance).
- **[React Router DOM](https://reactrouter.com/)** - Navegação e roteamento entre as páginas da aplicação.
- **[Axios](https://axios-http.com/)** - Cliente HTTP para integração com o backend, configurado com interceptadores de autenticação.
- **[Vercel Analytics](https://vercel.com/analytics)** - Monitoramento de métricas e acessos.

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/en/) (Versão 18 ou superior recomendada)
- `npm` ou `yarn`

## 🛠️ Instalação e Execução

1. Clone ou faça o download deste repositório.
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto (use o `.env.example` caso exista como base).
   - Defina a URL da API, por exemplo:
     ```env
     VITE_API_URL=http://localhost:8080/api
     ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível no endereço fornecido pelo Vite no terminal (geralmente `http://localhost:5173`).

## 📦 Build para Produção

Para gerar a versão otimizada de produção, execute:
```bash
npm run build
```
Os arquivos compilados estarão na pasta `dist/`, prontos para serem servidos ou implantados em plataformas como a **Vercel**.

## 🔒 Segurança

A aplicação utiliza **Autenticação via JWT**. O token é recebido no login e enviado via cabeçalho HTTP (`Authorization: Bearer <token>`) em todas as requisições autenticadas usando o Axios Interceptor. Perfis de acesso (`role`) são validados pelo token JWT descriptografado, evitando spoofing no `localStorage`.
