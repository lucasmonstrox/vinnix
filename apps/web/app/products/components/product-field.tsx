import { Label } from "@workspace/ui/components/label"

type ProductFieldProps = {
  id: string
  label: string
  children: React.ReactNode
}

export function ProductField({ id, label, children }: ProductFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
