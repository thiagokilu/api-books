import { z } from 'zod'

export const searchUsersSchema = z.object({
  username: z.string(),
})


export const searchUsersSucessResponseSchema = z.object({
  message: z.string(),
  users: z.array(z.object({
    id: z.string(),
    username: z.string(),
  })),
})


export const searchUsersErrorResponseSchema = z.object({
  message: z.string(),
})

export type SearchUsersQuerySchema = z.infer<typeof searchUsersSchema>;