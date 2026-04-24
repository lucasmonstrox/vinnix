import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { RegisterFieldError } from "./register-field-error"

type RegisterFieldProps = {
  id: string
  label: string
  type?: string
  autoComplete?: string
  errors?: string[]
}

export function RegisterField(props: RegisterFieldProps) {
  const { id, label, type = "text", autoComplete, errors } = props
  const errorId = `${id}-error`
  const message = errors?.[0]

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
      />
      <RegisterFieldError id={errorId} message={message} />
    </div>
  )
}
