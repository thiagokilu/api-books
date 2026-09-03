import type { FastifyRequest } from "fastify";
import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../../app/erros/unauthorizedError-error";

interface TokenPayload extends JwtPayload {
  sub: string;
}

export async function isAuth(request: FastifyRequest) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Authorization header missing");
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");

  try {
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const { sub } = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (!sub) {
      throw new UnauthorizedError();
    }

    request.userId = sub;
  } catch {
    throw new UnauthorizedError();
  }
}
