import type { RegisterState } from "../actions"

const CLASSES = `
  rounded-md border px-3 py-2 text-sm border-destructive/30
  bg-destructive/10 text-destructive
`

export function RegisterStatusError({ state }: { state: RegisterState }) {
  if (state.status !== "error") return null
  return (
    <p role="alert" className={CLASSES}>
      {state.message}
    </p>
  )
}
