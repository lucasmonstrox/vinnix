import Link from "next/link"

import { ProductForm } from "../components/product-form"

export default function NewProductPage() {
  return (
    <div className="flex min-h-svh w-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/products"
          className="
            text-xs text-muted-foreground
            hover:underline
          "
        >
          ← Produtos
        </Link>
        <h1 className="text-lg font-medium">Cadastrar produto</h1>
      </header>
      <ProductForm />
    </div>
  )
}
