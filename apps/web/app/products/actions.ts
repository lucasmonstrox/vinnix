"use server"

import { revalidatePath } from "next/cache"

import { hasProductId, pushProduct } from "./store"

export type AddProductState = {
  error?: string
  ok?: boolean
}

export async function addProduct(
  _prev: AddProductState,
  formData: FormData
): Promise<AddProductState> {
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "")
  const description = String(formData.get("description") ?? "")

  // User-owned validation block — see product-form contribution note.
  // Replace these 3 lines with your own normalize + validate logic
  // (trim, required fields, dedupe via hasProductId, max length…).
  if (!id || !name) return { error: "id e nome obrigatórios" }
  if (hasProductId(id)) return { error: "id já existe" }
  pushProduct({ id, name, description })

  revalidatePath("/products")
  return { ok: true }
}
