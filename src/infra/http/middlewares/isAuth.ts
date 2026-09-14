import type { FastifyRequest } from "fastify";
import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../../app/erros/unauthorizedError-error";

interface TokenPayload extends JwtPayload {
  sub: string;
}

export async function isAuth(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  const tokenFromCookie = request.cookies?.accessToken;

  const token = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "")
    : tokenFromCookie;

  if (!token) {
    throw new UnauthorizedError("Token não fornecido");
  }

  try {
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    request.userId = decoded.sub;
  } catch (err) {
    throw new UnauthorizedError();
  }
}
