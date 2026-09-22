# API Books

API REST para uma estante virtual de livros. Usuários podem criar uma conta, autenticar-se, confirmar o e-mail, recuperar a senha, buscar livros e administrar os itens da própria estante.

## Status atual

O núcleo da API está implementado e possui testes unitários e end-to-end. As rotas estão documentadas em OpenAPI/Swagger e o projeto conta com limitação de requisições via Redis.

| Área | Situação |
| --- | --- |
| Cadastro, login, logout e renovação de token | Implementado |
| Confirmação de e-mail e recuperação de senha | Implementado |
| Perfil do usuário | Implementado |
| Busca de livros | Implementado |
| Estante: adicionar, listar, remover e atualizar leitura | Implementado |
| Testes unitários e end-to-end | Implementados |
| Cálculo automático de percentual de leitura | Implementado |
| CI/CD | Implementado |

## Tecnologias

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

</div>

- Node.js e TypeScript
- Fastify, Zod e Swagger/OpenAPI
- PostgreSQL com Drizzle ORM
- Redis (sessões/tokens e rate limiting)
- JWT, cookies e bcrypt
- Resend para fluxos de e-mail
- Vitest e ESLint
- Docker Compose

## Rotas disponíveis

As rotas abaixo refletem a implementação atual. A referência completa de payloads e respostas está no Swagger.

| Método | Rota | Autenticação | Finalidade |
| --- | --- | :---: | --- |
| POST | `/sign-up` | Não | Criar conta |
| POST | `/sign-in` | Não | Autenticar usuário |
| POST | `/logout` | Sim | Encerrar sessão |
| POST | `/refresh-token` | Não | Renovar token de acesso |
| GET | `/me` | Sim | Obter perfil do usuário logado |
| POST | `/edit` | Sim | Atualizar perfil |
| POST | `/request-verification-email` | Sim | Solicitar e-mail de confirmação |
| POST | `/verify-email` | Não | Confirmar e-mail |
| POST | `/forgot-password` | Não | Iniciar recuperação de senha |
| POST | `/request-password` | Não | Redefinir senha com token |
| GET | `/books/search` | Não | Pesquisar livros por título ou autor |
| POST | `/add-book-shelf` | Sim | Adicionar livro à estante |
| GET | `/show-book-shelf/:userId` | Não | Consultar estante de um usuário |
| GET | `/users/:username/reading` | Não | Consultar estante pública de um usuário |
| POST | `/remove-book-shelf` | Sim | Remover livro da estante |
| POST | `/edit-book-reading-status` | Sim | Alterar status de leitura |
| POST | `/edit-book-reading-page` | Sim | Atualizar página atual |

## Pré-requisitos

- Node.js 20 ou superior
- pnpm (o repositório contém `pnpm-lock.yaml`)
- Docker e Docker Compose

## Como executar

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie seu arquivo de ambiente:

   ```bash
   cp .env.example .env
   ```

3. Ajuste o `.env`. Para usar os serviços do `docker-compose.yml` localmente, a configuração base é:

   ```env
   NODE_ENV=development
   DATABASE_URL="postgresql://docker:docker@localhost:5432/api_books"
   REDIS_URL="redis://localhost:6378"
   JWT_SECRET="uma-chave-com-no-minimo-32-caracteres"
   JWT_REFRESH_SECRET="outra-chave-com-no-minimo-32-caracteres"
   SALT_ROUNDS=10
   APP_URL="http://localhost:3333"
   RESEND_API_KEY=""
   ```

   `APP_URL` é obrigatória. A chave do Resend pode ficar vazia enquanto os fluxos de e-mail não forem exercitados.

4. Inicie PostgreSQL e Redis:

   ```bash
   docker compose up -d
   ```

5. Aplique as migrações do banco:

   ```bash
   pnpm exec drizzle-kit migrate
   ```

6. Inicie a API:

   ```bash
   pnpm dev
   ```

A aplicação escuta em `http://localhost:3333`.

## Documentação da API

Com o servidor em execução, acesse [http://localhost:3333/docs](http://localhost:3333/docs) para explorar as rotas, schemas, autenticação Bearer e respostas pela interface Swagger UI.

## Qualidade e testes

| Comando | Descrição |
| --- | --- |
| `pnpm test` | Executa todos os testes em modo watch |
| `pnpm test:unit` | Executa os testes unitários |
| `pnpm test:e2e` | Executa os testes end-to-end |
| `pnpm test:coverage` | Gera relatório de cobertura |
| `pnpm lint` | Verifica o código com ESLint |
| `pnpm build` | Compila TypeScript para `build/` |

Para uma execução única de toda a suíte, use:

```bash
pnpm exec vitest run
```

## Estrutura do projeto

```text
src/
├── app/                 # Casos de uso, erros e contratos de repositório
├── infra/
│   ├── db/              # Schema e relações do PostgreSQL
│   ├── http/            # Rotas, controllers, schemas e middlewares
│   └── lib/             # Ambiente, Redis, rate limit e utilitários
├── index.ts             # Cliente Drizzle
└── server.ts            # Configuração e inicialização do Fastify
```

As migrações versionadas ficam em `drizzle/`.

## Segurança

- Senhas protegidas com bcrypt.
- Access e refresh tokens com JWT.
- Rotas privadas protegidas por middleware de autenticação.
- Validação de entrada e serialização com Zod.
- Rate limiting global e limites específicos nas rotas sensíveis.

## Próximos passos

- Revisar a autorização da rota pública de consulta de estante conforme a política de privacidade desejada.

## Autor

Thiago Alexandre — [GitHub](https://github.com/thiagokilu)

## Licença

Este projeto está sob a licença MIT.
