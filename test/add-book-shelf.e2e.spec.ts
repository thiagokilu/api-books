// src/app/use-cases/add-book-shelf-usecase.e2e.spec.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("Add Book to Shelf (E2E)", () => {
    let accessToken: string;

    // 1. Sobe o servidor antes dos testes
    beforeAll(async () => {
        await app.ready();

        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        const usersRepository = new DrizzleUsersRepository();

        // 2. Cria um usuário (ignora erro caso já exista)
        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Test User",
                username: "e2etestuser",
                email: "e2etest@email.com",
                password: "senha123",
            },
        });

        const user = await usersRepository.findByEmail("e2etest@email.com");
        if (user) {
            await usersRepository.markEmailAsVerified(user.id);
        }

        // 3. Faz login e captura o accessToken do body
        const signInResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: "e2etest@email.com",
                password: "senha123",
            },
        });

        const body = signInResponse.json();
        accessToken = body.accessToken;
    });

    // 4. Encerra o servidor após os testes
    afterAll(async () => {
        await app.close();
    });

    // ✅ Cenário de sucesso
    it("should add a book to shelf and return 201", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/add-book-shelf", // ✅ URL correta da rota
            headers: {
                authorization: `Bearer ${accessToken}`, // ✅ usando Bearer token
            },
            payload: {
                title: "Clean Code",
                author_name: ["Robert C. Martin"],
                cover_i: 12345,
            },
        });

        expect(response.statusCode).toBe(201);
        expect(response.json()).toEqual({
            message: "Book added to shelf successfully",
        });
    });

    // ❌ Cenário sem autenticação
    it("should return 401 when not authenticated", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/add-book-shelf", // ✅ URL correta da rota
            payload: {
                title: "Clean Code",
                author_name: ["Robert C. Martin"],
                cover_i: 12345,
            },
        });

        expect(response.statusCode).toBe(401);
    });

    // ❌ Cenário com payload inválido
    it("should return 400 when body is invalid", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/add-book-shelf", // ✅ URL correta da rota
            headers: {
                authorization: `Bearer ${accessToken}`, // ✅ usando Bearer token
            },
            payload: {
                // "title" obrigatório não foi enviado
                author_name: ["Robert C. Martin"],
            },
        });

        expect(response.statusCode).toBe(400);
    });
});
