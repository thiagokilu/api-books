import type { FastifyRequest } from "fastify";
import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../../app/erros/unauthorizedError-error";

interface TokenPayload extends JwtPayload {
  sub: string;
}

export async function isAuth(request: FastifyRequest) {
  console.log("cookies:", request.cookies);
  console.log("authorization header:", request.headers.authorization);

  const authHeader = request.headers.authorization;
  const tokenFromCookie = request.cookies?.accessToken;

  const token = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "")
    : tokenFromCookie;

  console.log("token final:", token);

  if (!token) {
    throw new UnauthorizedError("Token não fornecido");
  }

  try {
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    console.log("decoded:", decoded);

    request.userId = decoded.sub;
  } catch (err) {
    console.log("erro no verify:", err); // <- isso vai te dizer o motivo real
    throw new UnauthorizedError();
  }
}
