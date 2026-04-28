"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { hasProductId, pushProduct } from "./store"

export type AddProductState = {
  error?: string
}

export async function addProduct(
  _prev: AddProductState,
  formData: FormData
): Promise<AddProductState> {
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "")
  const description = String(formData.get("description") ?? "")

  if (!id || !name) return { error: "id e nome obrigatórios" }
  if (hasProductId(id)) return { error: "id já existe" }
  pushProduct({ id, name, description })
  revalidatePath("/products")
  redirect(`/products/${id}`)
}
