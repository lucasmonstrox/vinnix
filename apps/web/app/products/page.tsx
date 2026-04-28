import { ProductForm } from "./components/product-form"
import { ProductList } from "./components/product-list"
import { listProducts } from "./store"

export default function ProductsPage() {
  const products = listProducts()

  return (
    <div className="flex min-h-svh w-full flex-col gap-8 p-6">
      <header>
        <h1 className="text-lg font-medium">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre e liste produtos (memória — perdido ao reiniciar).
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Cadastrar</h2>
        <ProductForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Lista ({products.length})</h2>
        <ProductList products={products} />
      </section>
    </div>
  )
}
