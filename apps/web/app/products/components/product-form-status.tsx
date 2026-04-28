import type { AddProductState } from "../actions"

type ProductFormStatusProps = {
  state: AddProductState
}

export function ProductFormStatus({ state }: ProductFormStatusProps) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>
  }
  if (state.ok) {
    return <p className="text-sm text-emerald-600">Produto cadastrado.</p>
  }
  return null
}
