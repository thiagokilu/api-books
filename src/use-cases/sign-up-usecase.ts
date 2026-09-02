import { db } from "../index"; // ajusta o path pro seu arquivo de conexão do drizzle
import { usersTable } from "../db/schema.js"; // ajusta o path pro seu schema
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import "dotenv/config";
import { UserAlreadyExistsError } from "../erros/user-already-exist-error.js";

interface ISignUpUseCaseRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | undefined;
}

interface ISignUpUseCaseResponse {
  id: string;
  email: string;
}

export async function signUpUseCase({
  email,
  name,
  username,
  password,
  bio,
}: ISignUpUseCaseRequest): Promise<ISignUpUseCaseResponse> {
  if (!email || !name || !username || !password) {
    throw new Error("Missing required fields");
  }

  const existingUser = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
    })
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
    .limit(1);

  if (existingUser[0]) {
    if (existingUser[0].email === email) {
      throw new UserAlreadyExistsError();
    }
    throw new UserAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(
    password,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
  );

  const result = await db
    .insert(usersTable)
    .values({
      email,
      name,
      username,
      password: hashedPassword,
      bio: bio ?? null,
    })
    .returning({ id: usersTable.id, email: usersTable.email });

  const user = result[0];

  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    id: user.id,
    email: user.email,
  };
}
