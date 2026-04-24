"use server"

import { type RegisterFieldErrors, registerSchema } from "./schema"

export type RegisterState = {
  status: "error" | "idle" | "success"
  message?: string
  errors?: RegisterFieldErrors
  user?: { id: string; name: string; email: string }
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrija os campos destacados.",
      errors: parsed.error.flatten().fieldErrors as RegisterFieldErrors,
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 400))

  return {
    status: "success",
    message: "Registro fake criado com sucesso.",
    user: {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email,
    },
  }
}
