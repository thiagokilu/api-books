import type { FastifyReply, FastifyRequest } from "fastify";
import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "../../../app/erros/unauthorizedError-error";
import type { UsersRepository } from "../../../app/repositories/users-repository";
import { DrizzleUsersRepository } from "../../../app/repositories/drizzle/drizzle-users-repository";

interface TokenPayload extends JwtPayload {
  sub: string;
}

export function isAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void>;
export function isAuth(
  request: FastifyRequest,
  usersRepository: UsersRepository,
): Promise<void>;
export async function isAuth(
  request: FastifyRequest,
  dependency: FastifyReply | UsersRepository,
) {
  const usersRepository =
    "findById" in dependency ? dependency : new DrizzleUsersRepository();
  const authHeader = request.headers.authorization;
  const tokenFromCookie = request.cookies?.accessToken;

  const token = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "")
    : tokenFromCookie;

  if (!token) {
    throw new UnauthorizedError("Token não fornecido");
  }

  let userId: string;

  try {
    const JWT_SECRET = String(process.env.JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    userId = decoded.sub;
  } catch {
    throw new UnauthorizedError();
  }

  const user = await usersRepository.findById(userId);

  if (!user || !user.emailVerified) {
    throw new UnauthorizedError("E-mail não verificado");
  }

  request.userId = userId;
}
