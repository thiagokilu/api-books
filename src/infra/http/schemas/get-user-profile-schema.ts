import { z } from "zod";

export const getUserProfileSuccessResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    createdAt: z.string()
  })
})

export const getUserProfileErrorResponseSchema = z.object({
  message: z.string(),
})

export type ProfileSuccessResponse = z.infer<typeof getUserProfileSuccessResponseSchema>
export type ProfileErrorResponse = z.infer<typeof getUserProfileErrorResponseSchema>
