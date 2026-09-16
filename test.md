1.  Em src/app/use-cases/request-password-usecase.ts:

// 1. Gerar token bruto: vai para o e-mail/link
const rawToken = randomBytes(32).toString("hex");

// 2. Gerar hash: vai para o banco
const tokenHash = createHash("sha256")
.update(rawToken)
.digest("hex");

// 3. Salvar somente o hash
await passwordResetTokensRepository.create({
userId: user.id,
token: tokenHash,
expiresAt,
});

// 4. Enviar o token bruto
const resetLink = `${process.env.APP_URL}/index.html?token=${rawToken}`;

Também adicione createHash ao import:

import { randomBytes, createHash } from "crypto";

2. Em src/app/use-cases/forgot-password-usecase.ts:

import { createHash } from "crypto";

// Token recebido do body/link
const tokenHash = createHash("sha256")
.update(token)
.digest("hex");

// Buscar usando o hash
const resetToken =
await passwordResetTokensRepository.findByToken(tokenHash);

Ou seja, substitua:

const resetToken = await passwordResetTokensRepository.findByToken(token);

por esse bloco.

3. Em src/app/repositories/drizzle/drizzle-password-reset-tokens-repository.ts:

Nenhuma mudança é obrigatória inicialmente. O método existente continuará funcionando:

async findByToken(token: string) {
return db
.select()
.from(passwordResetTokensTable)
.where(eq(passwordResetTokensTable.token, token));
}

A diferença é que, depois dos passos anteriores, o argumento token será o hash.

4. Em src/app/repositories/in-memory/in-memory-password-reset-tokens-repository.ts:

Também não exige alteração de lógica: ele passará a armazenar e buscar o hash recebido, como o repositório Drizzle.

5. Em src/app/use-cases/request-password-usecase.spec.ts:

Após obter o token salvo, valide que ele não aparece no link enviado. Você pode extrair o token bruto do mock de e-mail e comparar:

const savedToken = passwordResetTokensRepository.items[0]!.token;

const emailPayload = mockSend.mock.calls[0]![0];
expect(emailPayload.html).not.toContain(savedToken);

6. Em src/app/use-cases/forgot-password-usecase.spec.ts:

Ao criar manualmente um token para teste, salve o hash, mas passe o valor bruto ao caso de uso:

const rawToken = "token-de-teste";

const tokenHash = createHash("sha256")
.update(rawToken)
.digest("hex");

await passwordResetTokensRepository.create({
userId: user.id,
token: tokenHash,
expiresAt: new Date(Date.now() + 30 _ 60 _ 1000),
});

await forgotPasswordUseCase(
{ token: rawToken, newPassword: "nova-senha-segura" },
usersRepository,
passwordResetTokensRepository,
);

Não é necessária migration se a coluna atual token continuar existindo; ela apenas passará a armazenar o hash.

› Ask Codex to do anything

gpt-5.6-terra default · ~/Documentos/api-books · Analisar projeto tecnicamente
