import { randomBytes } from "crypto";
import type { UsersRepository } from "../repositories/users-repository";
import type { PasswordResetTokensRepository } from "../repositories/password-reset-tokens-repository";
import { Resend } from "resend";

export async function requestPasswordUseCase(
  { email }: { email: string },
  usersRepository: UsersRepository,
  passwordResetTokensRepository: PasswordResetTokensRepository,
) {
  const user = await usersRepository.findByEmail(email);

  // Não revele se o usuário existe (evita enumeração de e-mails)
  if (!user) {
    return {
      message:
        "If an account exists for this email, you will receive reset instructions.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await passwordResetTokensRepository.create({
    userId: user.id,
    token,
    expiresAt,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resetLink = `${process.env.APP_URL}/index.html?token=${token}`;

  const { error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [user.email],
    subject: "Redefinição de senha",
    html: `<p>Clique para redefinir sua senha (válido por 30 min):</p><a href="${resetLink}">${resetLink}</a>`,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }

  return {
    message:
      "If an account exists for this email, you will receive reset instructions.",
  };
}
