import type { Product } from "../store"

type ProductListProps = {
  products: readonly Product[]
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum produto cadastrado ainda.
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-md border">
      {products.map((p) => (
        <li key={p.id} className="flex flex-col gap-0.5 p-3">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{p.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              #{p.id}
            </span>
          </div>
          {p.description ? (
            <p className="text-sm text-muted-foreground">{p.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
