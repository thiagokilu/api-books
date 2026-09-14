import crypto from "crypto";
import type { UsersRepository } from "../repositories/users-repository";
import { Resend } from "resend";

const genericMessage = {
  message:
    "If an account exists for this email, you will receive verification instructions.",
};

export async function requestEmailVerification(
  userId: string,
  usersRepository: UsersRepository,
) {
  const user = await usersRepository.findById(userId);

  if (!user || user.emailVerified) {
    return genericMessage;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

  await usersRepository.saveVerificationToken(user.id, token, expiresAt);

  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [user.email],
    subject: "Verify your email",
    html: `<p>Olá ${user.name}, clique no link para verificar seu e-mail:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>
           <p> ${token} </p>
           `,
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }

  return genericMessage;
}
