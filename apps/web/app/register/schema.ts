import { z } from "zod"

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter ao menos 2 caracteres")
      .max(80, "Nome muito longo"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  })

type RegisterInput = z.infer<typeof registerSchema>

export type RegisterFieldErrors = Partial<
  Record<"_form" | keyof RegisterInput, string[]>
>
