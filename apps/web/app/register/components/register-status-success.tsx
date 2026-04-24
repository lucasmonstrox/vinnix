import type { RegisterState } from "../actions"

import { RegisterUserId } from "./register-user-id"

const CLASSES = `
  rounded-md border px-3 py-2 text-sm border-emerald-500/30
  bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
`

export function RegisterStatusSuccess({ state }: { state: RegisterState }) {
  if (state.status !== "success") return null
  return (
    <p role="status" className={CLASSES}>
      {state.message}
      <RegisterUserId id={state.user?.id} />
    </p>
  )
}
