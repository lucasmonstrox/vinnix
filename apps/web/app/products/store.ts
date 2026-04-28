export type Product = {
  id: string
  name: string
  description: string
}

const products: Product[] = []

export function listProducts(): readonly Product[] {
  return products
}

export function hasProductId(id: string): boolean {
  return products.some((p) => p.id === id)
}

export function pushProduct(product: Product): void {
  products.push(product)
}
