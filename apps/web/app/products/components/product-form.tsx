"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { useActionState } from "react"

import { type AddProductState, addProduct } from "../actions"
import { ProductField } from "./product-field"
import { ProductFormStatus } from "./product-form-status"

const INITIAL: AddProductState = {}

const TEXTAREA_CLASSES = `
  flex min-h-16 w-full rounded-md border border-input bg-transparent px-2.5
  py-1 text-sm shadow-xs outline-none
  placeholder:text-muted-foreground
  focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50
  dark:bg-input/30
`

export function ProductForm() {
  const [state, action, pending] = useActionState(addProduct, INITIAL)

  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <ProductField id="id" label="ID">
        <Input id="id" name="id" required />
      </ProductField>
      <ProductField id="name" label="Nome">
        <Input id="name" name="name" required />
      </ProductField>
      <ProductField id="description" label="Descrição">
        <textarea
          id="description"
          name="description"
          className={cn(TEXTAREA_CLASSES)}
        />
      </ProductField>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : "Cadastrar"}
      </Button>
      <ProductFormStatus state={state} />
    </form>
  )
}
