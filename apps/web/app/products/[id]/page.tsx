import Link from "next/link"
import { notFound } from "next/navigation"

import { getProduct } from "../store"

type ProductPageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  return (
    <div className="flex min-h-svh w-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <Link
          href="/products"
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Produtos
        </Link>
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-medium">{product.name}</h1>
          <span className="font-mono text-xs text-muted-foreground">
            #{product.id}
          </span>
        </div>
      </header>
      {product.description ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          {product.description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sem descrição.</p>
      )}
    </div>
  )
}
