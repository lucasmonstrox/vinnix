"use client"

import { Button } from "@workspace/ui/components/button"
import { useActionState } from "react"

import { registerAction, type RegisterState } from "../actions"
import { RegisterField } from "./register-field"
import { RegisterStatusError } from "./register-status-error"
import { RegisterStatusSuccess } from "./register-status-success"

const initialState: RegisterState = { status: "idle" }

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState)
  const errors = state.errors ?? {}

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <RegisterField
        id="name"
        label="Nome"
        autoComplete="name"
        errors={errors.name}
      />
      <RegisterField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        errors={errors.email}
      />
      <RegisterField
        id="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        errors={errors.password}
      />
      <RegisterField
        id="confirmPassword"
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        errors={errors.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar conta"}
      </Button>
      <RegisterStatusSuccess state={state} />
      <RegisterStatusError state={state} />
    </form>
  )
}
