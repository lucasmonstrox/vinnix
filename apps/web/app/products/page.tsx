import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

import { ProductList } from "./components/product-list"
import { listProducts } from "./store"

export default function ProductsPage() {
  const products = listProducts()

  return (
    <div className="flex min-h-svh w-full flex-col gap-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Lista de produtos (memória — perdido ao reiniciar).
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">Cadastrar</Link>
        </Button>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Lista ({products.length})</h2>
        <ProductList products={products} />
      </section>
    </div>
  )
}
