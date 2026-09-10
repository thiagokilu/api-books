# 📚 API Books

API REST para gerenciamento de uma **estante virtual de livros**, permitindo que usuários criem suas contas, autentiquem-se, pesquisem livros e acompanhem seu progresso de leitura.

O projeto foi desenvolvido com foco em **boas práticas de desenvolvimento backend**, autenticação segura, testes automatizados, documentação da API e organização em camadas.

---

## 🚀 Tecnologias

<div align="center">

<img src="https://skillicons.dev/icons?i=nodejs,typescript,fastify,postgres,prisma,docker,githubactions,jest,git,github" />

</div>

### Backend

* **Node.js** — Runtime JavaScript
* **TypeScript** — Tipagem estática
* **Fastify** — Framework web
* **JWT** — Autenticação baseada em tokens
* **bcrypt** — Hash de senhas
* **Zod** — Validação e tipagem de dados
* **Resend** — Envio de e-mails

### Banco de dados

* **PostgreSQL**
* **Prisma ORM**

### Testes e qualidade

* **Vitest** — Testes automatizados
* **Swagger / OpenAPI** — Documentação da API
* **ESLint** — Padronização e qualidade do código

### DevOps

* **Docker**
* **GitHub Actions**
* **Git / GitHub**

---

## ✨ Funcionalidades

### 🔐 Autenticação

* [ ] Criar uma conta
* [ ] Fazer login
* [ ] Confirmar e-mail após o cadastro
* [ ] Enviar e-mail de confirmação via Resend
* [ ] Recuperar senha por e-mail
* [ ] Redefinir senha através de link enviado por e-mail
* [ ] Autenticação utilizando JWT
* [ ] Armazenamento seguro de senhas utilizando hash

### 📖 Livros e estante

* [ ] Pesquisar livros por título ou autor
* [ ] Adicionar livros à estante
* [ ] Remover livros da estante
* [ ] Alterar status de leitura
* [ ] Atualizar progresso de leitura
* [ ] Calcular automaticamente o percentual de leitura
* [ ] Exibir resumo da estante no dashboard

### 👤 Perfil

* [ ] Editar dados do perfil

---

## 📋 Requisitos funcionais

| ID   | Requisito                                                              | Status |
| ---- | ---------------------------------------------------------------------- | :----: |
| RF01 | O usuário deve conseguir criar uma conta.                              |    ⬜   |
| RF02 | O usuário deve conseguir fazer login.                                  |    ⬜   |
| RF03 | O sistema deve enviar um e-mail de confirmação após o cadastro.        |    ⬜   |
| RF04 | O usuário deve confirmar seu e-mail antes de acessar a estante.        |    ⬜   |
| RF05 | O usuário deve conseguir solicitar redefinição de senha por e-mail.    |    ⬜   |
| RF06 | O usuário deve conseguir redefinir sua senha através do link recebido. |    ⬜   |
| RF07 | O usuário deve conseguir pesquisar livros por título ou autor.         |    ⬜   |
| RF08 | O usuário deve conseguir adicionar um livro à sua estante.             |    ⬜   |
| RF09 | O usuário deve conseguir remover um livro da sua estante.              |    ⬜   |
| RF10 | O usuário deve conseguir alterar o status de leitura.                  |    ⬜   |
| RF11 | O usuário deve conseguir atualizar seu progresso de leitura.           |    ⬜   |
| RF12 | O sistema deve calcular automaticamente o percentual de leitura.       |    ⬜   |
| RF13 | O sistema deve exibir um resumo da estante no dashboard.               |    ⬜   |
| RF14 | O usuário deve conseguir editar seus dados de perfil.                  |    ⬜   |

---

## ⚙️ Requisitos não funcionais

| ID    | Requisito                                                                        | Status |
| ----- | -------------------------------------------------------------------------------- | :----: |
| RNF01 | A aplicação deve ser responsiva.                                                 |    ⬜   |
| RNF02 | Senhas devem ser armazenadas utilizando hash e a autenticação deve utilizar JWT. |    ⬜   |
| RNF03 | A API deve retornar mensagens de erro padronizadas.                              |    ⬜   |
| RNF04 | O projeto deve possuir testes automatizados e documentação via Swagger/OpenAPI.  |    ⬜   |

### Formato padrão de erro

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura organizada em camadas, buscando separar as responsabilidades da aplicação.

```text
src/
├── app/
│   ├── controllers/
│   ├── repositories/
│   ├── use-cases/
│   └── ...
│
├── lib/
│
├── middlewares/
│
├── routes/
│
├── server.ts
└── ...
```

A ideia é manter:

* **Controllers** → entrada e saída das requisições
* **Use Cases** → regras de negócio
* **Repositories** → acesso aos dados
* **Routes** → definição dos endpoints
* **Schemas** → validação dos dados
* **Middlewares** → autenticação e comportamentos compartilhados

---

## 🐳 Executando o projeto

### Pré-requisitos

Antes de começar, você precisa ter instalado:

* Node.js
* npm
* Docker
* Docker Compose

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>

cd api-books
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis necessárias, como:

```env
DATABASE_URL=

JWT_SECRET=
JWT_REFRESH_TOKEN=

SALT_ROUNDS=10

RESEND_API_KEY=
```

### 4. Suba o banco de dados

```bash
docker compose up -d
```

### 5. Execute a aplicação

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3333
```

---

## 📚 Documentação da API

A API possui documentação utilizando **Swagger/OpenAPI**.

Com o servidor em execução, acesse:

```text
http://localhost:3333/docs
```

A documentação permite visualizar os endpoints, parâmetros, schemas e realizar requisições diretamente pelo Swagger UI.

---

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

Para executar os testes em modo de observação:

```bash
npm run test:watch
```

Para verificar a cobertura:

```bash
npm run test:coverage
```

---

## 🔒 Segurança

O projeto utiliza algumas práticas para proteger os dados dos usuários:

* 🔐 Senhas armazenadas utilizando **bcrypt**
* 🎫 Autenticação utilizando **JWT**
* 🔄 Refresh Token
* ✉️ Confirmação de e-mail
* 🔑 Recuperação de senha através de token
* ✅ Validação de dados utilizando **Zod**
* 🚫 Proteção de rotas autenticadas

---

## 📈 Roadmap

### Autenticação

* [ ] Cadastro
* [ ] Login
* [ ] Refresh Token
* [ ] Confirmação de e-mail
* [ ] Recuperação de senha
* [ ] Redefinição de senha

### Biblioteca

* [ ] Pesquisa de livros
* [ ] Adicionar à estante
* [ ] Remover da estante
* [ ] Status de leitura
* [ ] Progresso de leitura
* [ ] Percentual automático

### Usuário

* [ ] Dashboard
* [ ] Perfil
* [ ] Estatísticas de leitura

### Qualidade

* [ ] Testes unitários
* [ ] Testes de integração
* [ ] Cobertura de testes
* [ ] CI/CD
* [ ] Documentação completa da API

---

## 📦 Scripts

| Comando                 | Descrição                            |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Inicia o servidor em desenvolvimento |
| `npm test`              | Executa os testes                    |
| `npm run test:watch`    | Executa os testes em modo watch      |
| `npm run test:coverage` | Executa os testes com cobertura      |

---

## 👨‍💻 Autor

**Thiago Alexandre**

Desenvolvedor Front-End / Full Stack em formação.

<div align="left">

<a href="https://github.com/thiagokilu">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
</a>

</div>

---

## 📄 Licença

Este projeto está sob a licença MIT.
